import { generateICSFile } from "../core/calendar-util.js";
import clientMetadata from "../core/clientMetadata.js";

document.addEventListener("DOMContentLoaded", () => {
  /********************************************************
   * ============  Utility Functions  ======================
   ********************************************************/
  function handleICSDownload() {
    const eventDetails = {
      title: "Sample Event Title", // Replace or make dynamic
      description: "Description of the event goes here.", // Replace or make dynamic
      location: "Office Conference Room", // Replace or make dynamic
      startDate: new Date("2025-01-10T09:00:00Z"), // Replace or make dynamic
      endDate: new Date("2025-01-10T10:00:00Z"), // Replace or make dynamic
    };

    generateICSFile(eventDetails);
  }
  // Generates a UUID-like ID
  function generateUniqueId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Removes AI label prefix
  function removeAILabel(response) {
    const prefix = "Enhancer AI:";
    return response.startsWith(prefix)
      ? response.substring(prefix.length).trim()
      : response;
  }

  // Builds a prompt for each action
  function constructPrompt(action, userInput) {
    const sanitizedInput = cleanResponse(userInput); // Sanitize input
    switch (action) {
      case "chat":
        return `Paralegal Mode: ${sanitizedInput}`;
      case "summarize":
        return `Summarize the following content in the least amount of words but don't leave out any important information: \n\n${userInput}`;
      case "generate-bullet-points":
        return `Convert to bullet points:\n\n${sanitizedInput}`;
      case "draft-summary":
        return `Draft a summary:\n\n${sanitizedInput}`;

      // New paralegal-related cases:
      case "document-preparation":
        return `Assist with document preparation, including formatting and reviewing:\n\n${sanitizedInput}`;
      case "legal-research":
        return `Conduct thorough legal research on the following topic:\n\n${sanitizedInput}`;
      case "case-management":
        return `Assist with case management tasks, including tracking deadlines and organizing files:\n\n${sanitizedInput}`;
      case "client-interaction":
        return `Provide assistance with client interaction tasks. Prepare the following:\n\n${sanitizedInput}`;

      default:
        throw new Error("Invalid action selected.");
    }
  }

  // Cleans markdown from response for on-screen display
  function cleanResponse(response) {
    return response
      .replace(/###/g, "") // Remove hashes
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

  // **NEW**: Removes unwanted Markdown but **preserves** bullet points or special formatting for downloads

  function sanitizeForDownload(text) {
    return text
      .replace(/[*#]/g, "") // Remove Markdown-like formatting
      .replace(/\s{2,}/g, " ") // Replace multiple spaces with a single space
      .replace(/^\s+|\s+$/gm, "") // Trim leading and trailing whitespace from each line
      .replace(/\n{2,}/g, "\n\n") // Replace multiple newlines with a single newline
      .trim(); // Remove extra spaces at the start and end
  }

  function formatAndTruncateResponse(message, sentenceLimit = 4) {
    const cleaned = cleanResponse(message); // Clean unwanted characters

    // Split text into sentences using punctuation as delimiters
    const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned]; // Split into sentences or fallback to full text

    const wrapper = document.createElement("div");
    wrapper.className = "formatted-response";

    // Limit to the first `sentenceLimit` sentences
    const truncatedSentences = sentences.slice(0, sentenceLimit);
    const remainingSentences = sentences.slice(sentenceLimit);

    // Create the truncated paragraph
    const truncatedP = document.createElement("p");
    truncatedP.textContent = truncatedSentences.join(" ");
    wrapper.appendChild(truncatedP);

    // Add "Show More" logic for remaining sentences
    if (remainingSentences.length > 0) {
      const fullDiv = document.createElement("div");
      fullDiv.className = "full-response";
      fullDiv.style.display = "none"; // Hidden initially
      fullDiv.textContent = remainingSentences.join(" ");

      // Create the "Show More" toggle
      const toggle = document.createElement("span");
      toggle.textContent = " Show More...";
      toggle.className = "show-more-link";
      toggle.style.color = "blue";
      toggle.style.cursor = "pointer";
      toggle.addEventListener("click", () => {
        if (fullDiv.style.display === "none") {
          fullDiv.style.display = "inline"; // Show the full text
          toggle.textContent = " Show Less...";
        } else {
          fullDiv.style.display = "none"; // Hide the full text
          toggle.textContent = " Show More...";
        }
      });

      // Append the full text and toggle to the wrapper
      wrapper.appendChild(fullDiv);
      wrapper.appendChild(toggle);
    }

    return wrapper;
  }

  // Shows AI text in the UI
  function displayResponse(msg) {
    const div = document.querySelector(".formatted-response");
    div.innerHTML = "";
    div.appendChild(formatAndTruncateResponse(sanitizeText(msg)));
  }

  // Shows metadata in the UI
  function displayMetadata(data) {
    const div = document.querySelector(".formatted-response");
    div.innerHTML = "";
    const metaP = document.createElement("p");
    metaP.textContent = sanitizeText(data);
    div.appendChild(metaP);
  }

  // Mapping of metadata types to trigger phrases
  const metadataPhrases = {
    firmInfo: [
      "firm info",
      "company information",
      "company info",
      "information about the firm",
      "details about the company",
      "company details",
    ],
    personInCharge: [
      "who is in charge",
      "who's in charge",
      "person in charge",
      "lead of the firm",
      "head of the company",
      "person responsible",
    ],
    aboutFirm: [
      "tell me about your firm",
      "tell me about your company",
      "information about your firm",
      "information about your company",
      "details about your firm",
      "details about your company",
    ],
    generalMetadata: [
      "metadata",
      "meta information",
      "data about the firm",
      "information data",
      "general info",
      "general information",
    ],
  };

  function getMetadataType(input) {
    const lowerInput = input.toLowerCase();

    for (const [type, phrases] of Object.entries(metadataPhrases)) {
      for (const phrase of phrases) {
        if (lowerInput.includes(phrase)) {
          return type;
        }
      }
    }
    return null;
  }

  function sanitizeText(text) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    let sanitized = tempDiv.textContent || tempDiv.innerText || "";
    sanitized = sanitized.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    sanitized = sanitized.replace(/\s+/g, " ").trim();
    return sanitized;
  }

  async function processInput(action, userInput) {
    const metadataType = getMetadataType(userInput);

    // Handle metadata requests
    if (metadataType) {
      let metadataResponse = "";

      switch (metadataType) {
        case "firmInfo":
          metadataResponse = `Firm Name: ${clientMetadata.firmName}\nTagline: ${clientMetadata.tagline}`;
          break;
        case "personInCharge":
          metadataResponse = `Person in Charge: ${clientMetadata.personInCharge.name} (${clientMetadata.personInCharge.title})\nContact: ${clientMetadata.personInCharge.contact}`;
          break;
        case "aboutFirm":
          metadataResponse = `
Firm Name: ${clientMetadata.firmName}
Tagline: ${clientMetadata.tagline}
Person in Charge: ${clientMetadata.personInCharge.name} (${
            clientMetadata.personInCharge.title
          })
Contact: ${clientMetadata.personInCharge.contact}
Specialties: ${clientMetadata.specialties.join(", ")}
Locations:
${clientMetadata.locations
  .map(
    (location) =>
      `  - ${location.office}: ${location.address}, Phone: ${location.phone}, Email: ${location.email}`
  )
  .join("\n")}`;
          break;
        case "generalMetadata":
          metadataResponse = `
Firm: ${clientMetadata.firmName}
Person in Charge: ${clientMetadata.personInCharge.name} (${clientMetadata.personInCharge.title})
Contact: ${clientMetadata.personInCharge.contact}
Code of Conduct: ${clientMetadata.codeOfConduct.summary}
Confidentiality Notice: ${clientMetadata.confidentialityNotice}
Legal Disclaimer: ${clientMetadata.legalDisclaimer}`;
          break;
        default:
          metadataResponse = "Metadata information is currently unavailable.";
      }

      displayMetadata(metadataResponse);
      const newChat = saveChatHistory(userInput, metadataResponse, action);
      return newChat;
    }

    // Otherwise, normal AI request
    const prompt = constructPrompt(action, userInput);

    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      let aiResponse = data.response || "No response received.";

      if (aiResponse.startsWith(prompt)) {
        aiResponse = aiResponse.substring(prompt.length).trim();
      }

      const finalAIResponse = aiResponse;
      displayResponse(finalAIResponse);
      const newChat = saveChatHistory(userInput, finalAIResponse, action);
      return newChat;
    } catch (error) {
      console.error("Error processing input:", error);
      alert("An error occurred while processing your request.");
      return null;
    }
  }

  function userRequestsMetadata(input) {
    return getMetadataType(input) !== null;
  }

  function formatTimestamp(ts) {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) throw new Error("Invalid date");
      return d.toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  }

  function getBackgroundColor(a) {
    switch (a) {
      case "chat":
        return "#f7ffeb"; // Existing Chat
      case "summarize":
        return "#e7f4ff"; // Existing Summarize
      case "generate-bullet-points":
        return "#f3e7ff"; // Existing Generate Bullet Points
      case "draft-summary":
        return "#fffbe7"; // Existing Draft Summary

      // New actions with their own colors:
      case "document-preparation":
        return "#e0fffa"; // Light teal for Document Prep
      case "legal-research":
        return "#ffe0f6"; // Light pink for Legal Research
      case "case-management":
        return "#e7ffe0"; // Light green for Case Management
      case "client-interaction":
        return "#fff0e0"; // Light orange for Client Interaction

      default:
        return "#f7ffeb"; // Fallback color
    }
  }

  function downloadTextFile(fname, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function readFileAsText(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = (e) => res(e.target.result);
      reader.onerror = (e) => rej(e);
      reader.readAsText(file);
    });
  }

  async function performOCR(file) {
    try {
      const div = document.querySelector(".formatted-response");
      div.innerHTML = "<p>Performing OCR...</p>";
      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            div.innerHTML = `<p>Performing OCR: ${Math.round(
              m.progress * 100
            )}%</p>`;
          }
        },
      });
      return text || "";
    } catch {
      alert("OCR failed.");
      document.querySelector(".formatted-response").innerHTML = "";
      return null;
    }
  }

  /********************************************************
   * ============  Element References  =====================
   ********************************************************/
  const saveAllChatsButton = document.getElementById("save-all-chats");
  const overlay = document.getElementById("overlay");
  const closeOverlayButton = document.getElementById("close-overlay");
  const triggerOverlayButton = document.getElementById("show-overlay");
  const dropArea = document.getElementById("drop-area");
  const clearFileButton = document.getElementById("clear-file");
  const sendButton = document.getElementById("send-prompt");
  const userPrompt = document.getElementById("user-prompt");
  const actionDropdown = document.getElementById("action-dropdown");
  const responseDiv = document.querySelector(".formatted-response");
  const fileInput = document.getElementById("summarize-file-upload");
  const uploadIndicator = document.getElementById("upload-indicator");
  const uploadedFilename = document.getElementById("uploaded-filename");
  const clearHistoryButton = document.getElementById("clear-history");
  const closeButton = document.getElementById("close-button");

  /********************************************************
   * ==========  Overlay Show/Hide Handlers  ==============
   ********************************************************/
  function showOverlay() {
    overlay.style.display = "flex";
  }
  function hideOverlay() {
    overlay.style.display = "none";
  }
  closeOverlayButton?.addEventListener("click", hideOverlay);
  triggerOverlayButton?.addEventListener("click", showOverlay);

  /********************************************************
   * ==========  Chat History Container Setup  ============
   ********************************************************/
  const chatHistoryContainer = document.createElement("div");
  chatHistoryContainer.className = "chat-history-container";

  const chatHistoryTitle = document.createElement("h2");
  chatHistoryTitle.textContent = "Chat History";
  chatHistoryTitle.className = "chat-history-title";

  const chatHistoryDiv = document.createElement("div");
  chatHistoryDiv.className = "chat-history";
  chatHistoryContainer.appendChild(chatHistoryTitle);
  chatHistoryContainer.appendChild(chatHistoryDiv);
  document.body.appendChild(chatHistoryContainer);

  /********************************************************
   * ===============  Chat History Updates  ===============
   ********************************************************/
  function updateChatHistoryVisibility() {
    const saved = JSON.parse(localStorage.getItem("chatHistory")) || [];
    if (saved.length) {
      chatHistoryContainer.style.display = "block";
      saveAllChatsButton?.classList.add("visible");
    } else {
      chatHistoryContainer.style.display = "none";
      saveAllChatsButton?.classList.remove("visible");
    }
  }

  function updateSaveChatsButtonVisibility() {
    const saved = JSON.parse(localStorage.getItem("chatHistory")) || [];
    if (saved.length) {
      saveAllChatsButton?.classList.add("visible");
    } else {
      saveAllChatsButton?.classList.remove("visible");
      chatHistoryDiv.style.marginBottom = "0";
    }
  }

  /********************************************************
   * ===============  Save All Chats Function  ============
   ********************************************************/
  function saveAllChats() {
    const saved = JSON.parse(localStorage.getItem("chatHistory")) || [];
    if (!saved.length) {
      alert("No chats to save!");
      return;
    }

    let content = "======= All Chat Histories =======\n\n";

    saved.forEach((chat, i) => {
      const action = chat.action || "chat";
      const timestamp = formatTimestamp(chat.time);

      // Use our new sanitizer for both user and AI
      const sanitizedUser = sanitizeForDownload(chat.user);
      const sanitizedAI = sanitizeForDownload(chat.ai);

      content += `------------------------------
Chat ${i + 1}: (${action.toUpperCase()})
Timestamp: ${timestamp}
------------------------------

User:
${sanitizedUser}

AI:
${sanitizedAI}

==============================

`;
    });

    downloadTextFile("All_Chat_History.txt", content);
  }
  saveAllChatsButton?.addEventListener("click", saveAllChats);

  /********************************************************
   * ==========  Close Button Handler  =====================
   ********************************************************/
  closeButton?.addEventListener("click", () => window.close());

  /********************************************************
   * ===============  Download Chat Function  ==============
   ********************************************************/
  function downloadChat(chat) {
    const action = chat.action || "chat";
    const timestamp = formatTimestamp(chat.time);

    // Convert user + AI to plain text with bullet points or summaries intact
    const sanitizedUser = sanitizeForDownload(chat.user);
    const sanitizedAI = sanitizeForDownload(chat.ai);

    const content = `==============================
Chat (${action.toUpperCase()})
Timestamp: ${timestamp}
==============================

User:
${sanitizedUser}

AI:
${sanitizedAI}

==============================

`;

    const filename = `Chat_${action.toUpperCase()}_${timestamp.replace(
      /[:\/\\?%*|"<>]/g,
      "-"
    )}.txt`;

    downloadTextFile(filename, content);
  }

  /********************************************************
   * ============  Delete Specific Chat Function ============
   ********************************************************/
  function deleteChat(chatId) {
    let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    history = history.filter((c) => c.id !== chatId);
    localStorage.setItem("chatHistory", JSON.stringify(history));
    loadChatHistory();
    alert("Chat deleted.");
  }

  /********************************************************
   * =============  Save Chat History Function  ============
   ********************************************************/
  function base64EncodeUnicode(str) {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (m, p1) =>
        String.fromCharCode("0x" + p1)
      )
    );
  }

  function saveChatHistory(userMessage, aiResponse, action) {
    // Skip saving metadata requests
    if (userRequestsMetadata(userMessage)) {
      console.log("Metadata request detected. Not saving to chat history.");
      return null;
    }
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    const timestamp = new Date().toISOString();

    // No more removing first sentence. Keep them intact.
    const cleanedUserMessage = userMessage.trim();
    const cleanedAIResponse = aiResponse.trim();

    const finalUserMessage = removeAILabel(cleanedUserMessage);
    const finalAIResponse = removeAILabel(cleanedAIResponse);

    const chatHash = base64EncodeUnicode(
      `${finalUserMessage}_${finalAIResponse}_${action}`
    );

    const newChat = {
      id: generateUniqueId(),
      user: finalUserMessage,
      ai: finalAIResponse,
      action: action,
      time: timestamp,
      hash: chatHash,
    };

    chatHistory.unshift(newChat);

    if (chatHistory.length > 10) {
      chatHistory.pop();
    }

    try {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
      console.log("Chat history saved successfully:", chatHistory);
      updateChatHistoryVisibility();
      return newChat;
    } catch (error) {
      console.error("Error saving chat history:", error);
      alert("An error occurred while saving the chat history.");
      return null;
    }
  }

  /********************************************************
   * ==========  Add Event Listener for .ics Download ======
   ********************************************************/

  const downloadICSButton = document.getElementById("download-ics");
  if (downloadICSButton) {
    downloadICSButton.addEventListener("click", handleICSDownload);
  }

  /********************************************************
   * ============  File Upload Event Listeners  ===========
   ********************************************************/
  function showUploadIndicator(fname) {
    uploadedFilename.textContent = `Uploaded: ${fname}`;
    uploadIndicator.classList.remove("hidden");
    localStorage.setItem("uploadedFileName", fname);
  }

  function clearUploadedFile() {
    localStorage.removeItem("uploadedFileName");
    uploadIndicator.classList.add("hidden");
    fileInput.value = "";
    userPrompt.disabled = false;
  }

  function handleFileUpload(file) {
    const action = actionDropdown.value;
    if (action !== "chat" && file) {
      userPrompt.value = "";
      userPrompt.disabled = true;
    }
  }

  ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) => {
    dropArea.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  dropArea.addEventListener("dragover", () =>
    dropArea.classList.add("drag-over")
  );
  dropArea.addEventListener("dragleave", () =>
    dropArea.classList.remove("drag-over")
  );
  dropArea.addEventListener("drop", (e) => {
    dropArea.classList.remove("drag-over");
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      fileInput.files = files;
      showUploadIndicator(files[0].name);
      handleFileUpload(files[0]);
    }
  });
  dropArea.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const f = fileInput.files[0];
    if (f) {
      showUploadIndicator(f.name);
      handleFileUpload(f);
    }
  });
  clearFileButton.addEventListener("click", clearUploadedFile);

  /********************************************************
   * ============  Send Button / Process Input  ===========
   ********************************************************/
  sendButton.addEventListener("click", async () => {
    const action = actionDropdown.value;
    const txt = userPrompt.value.trim();
    const file = fileInput.files[0];

    if (!txt && action !== "chat" && !file) {
      alert("Provide input or a file.");
      return;
    }

    responseDiv.innerHTML = "<p>Loading...</p>";

    let userInput = txt || "No additional input provided.";
    if (file) {
      if (/^image\//i.test(file.type)) {
        const extractedText = await performOCR(file);
        if (!extractedText) return;
        userInput = extractedText;
      } else {
        try {
          userInput = await readFileAsText(file);
        } catch (e) {
          console.error("File read error:", e);
          userInput = `File uploaded: ${file.name}`;
        }
      }
      const formData = new FormData();
      formData.append("prompt", userInput);
      formData.append("action", action);
      formData.append("file", file);
      try {
        const resp = await fetch("http://localhost:3000/chat", {
          method: "POST",
          body: formData,
        });
        if (!resp.ok) throw new Error(`Server error ${resp.status}`);
        const d = await resp.json();
        const finalAI = d.response || "No response received.";
        displayResponse(finalAI);

        // Save and also update UI chat list
        const newChat = saveChatHistory(userInput, finalAI, action);
        if (newChat) appendChatMessage(newChat);
      } catch (err) {
        console.error("File input error:", err);
        alert("Error processing file.");
      }
    } else {
      try {
        const newChat = await processInput(action, userInput);
        if (newChat) appendChatMessage(newChat);
      } catch (err) {
        console.error("No-file error:", err);
        alert("Error processing input.");
      }
    }
  });

  /********************************************************
   * ============  Load & Display Chat History  ===========
   ********************************************************/
  function loadChatHistory() {
    let saved = JSON.parse(localStorage.getItem("chatHistory")) || [];
    saved = saved.slice().reverse();
    chatHistoryDiv.innerHTML = "";
    saved.forEach((chat) => {
      appendChatMessage(chat);
    });
    requestAnimationFrame(() => (chatHistoryDiv.scrollTop = 0));
    updateChatHistoryVisibility(); // Ensure visibility is updated based on saved chats
    updateSaveChatsButtonVisibility();
  }

  // Clears all chat histories and resets UI
  function clearAll() {
    clearUploadedFile();
    responseDiv.textContent = "";
    localStorage.removeItem("chatHistory");
    chatHistoryDiv.innerHTML = "";
    updateChatHistoryVisibility();
  }
  clearHistoryButton?.addEventListener("click", () => {
    if (confirm("Clear chat history?")) clearAll();
  });

  /**
   * Appends a single chat message to the chat history UI.
   * @param {Object|null} chat - The chat object to append. If null, do nothing.
   */
  function appendChatMessage(chat) {
    if (!chat) return;

    const action = chat.action || "chat";
    const cMsg = document.createElement("div");
    cMsg.className = "chat-message";
    cMsg.style.backgroundColor = getBackgroundColor(action);
    cMsg.classList.add(action);

    // User div
    const userDiv = document.createElement("div");
    userDiv.className = "user";
    userDiv.innerHTML = `<strong>User (${action.toUpperCase()}):</strong>`;
    userDiv.appendChild(formatAndTruncateResponse(chat.user));

    // AI div
    const aiDiv = document.createElement("div");
    aiDiv.className = "ai";
    aiDiv.innerHTML = `<strong>Enhancer AI:</strong>`;
    aiDiv.appendChild(formatAndTruncateResponse(chat.ai));

    // Timestamp
    const timeDiv = document.createElement("div");
    timeDiv.className = "timestamp";
    timeDiv.textContent = `Sent on: ${formatTimestamp(chat.time)}`;
    timeDiv.style.color = "#9d9d9d";

    // Download Chat Button
    const dlBtn = document.createElement("button");
    dlBtn.className = "download-chat";
    dlBtn.textContent = "Download Chat";
    dlBtn.style.marginTop = "5px";
    dlBtn.style.backgroundColor = getBackgroundColor(action);
    dlBtn.style.border = "1px solid #0000001a";
    dlBtn.style.color = "#333";
    dlBtn.style.padding = "10px";
    dlBtn.style.borderRadius = "5px";
    dlBtn.style.fontSize = "10px";
    dlBtn.style.textTransform = "uppercase";
    dlBtn.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.2)";
    dlBtn.style.cursor = "pointer";
    dlBtn.addEventListener("click", () => downloadChat(chat));

    // Delete Chat Button
    const delBtn = document.createElement("button");
    delBtn.className = "delete-chat";
    delBtn.textContent = "Delete Chat";
    delBtn.style.marginTop = "5px";
    delBtn.style.backgroundColor = getBackgroundColor(action);
    delBtn.style.border = "1px solid #0000001a";
    delBtn.style.color = "#333";
    delBtn.style.padding = "10px";
    delBtn.style.borderRadius = "5px";
    delBtn.style.fontSize = "10px";
    delBtn.style.textTransform = "uppercase";
    delBtn.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.2)";
    delBtn.style.cursor = "pointer";
    delBtn.style.marginLeft = "10px";
    delBtn.setAttribute("data-chat-id", chat.id);
    delBtn.addEventListener("click", (ev) => {
      const cid = ev.target.getAttribute("data-chat-id");
      if (confirm("Delete this chat?")) deleteChat(cid);
    });

    // ICS Download Button
    const icsBtn = document.createElement("button");
    icsBtn.className = "download-chat";
    icsBtn.textContent = "Download Event (.ics)";
    icsBtn.style.marginTop = "5px";
    icsBtn.style.backgroundColor = getBackgroundColor(action);
    icsBtn.style.border = "1px solid #0000001a";
    icsBtn.style.color = "#333";
    icsBtn.style.padding = "10px";
    icsBtn.style.borderRadius = "5px";
    icsBtn.style.fontSize = "10px";
    icsBtn.style.textTransform = "uppercase";
    icsBtn.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.2)";
    icsBtn.style.cursor = "pointer";
    icsBtn.addEventListener("click", () => {
      const eventDetails = {
        title: `Chat with ${chat.user}`, // Replace with dynamic content
        description: `AI Response: ${chat.ai}`, // Replace with dynamic content
        location: "Online", // Optional: add a meaningful location
        startDate: new Date(), // Replace with an appropriate timestamp
        endDate: new Date(new Date().getTime() + 60 * 60 * 1000), // Example: 1-hour duration
      };
      generateICSFile(eventDetails);
    });

    // Buttons Container
    const btnWrap = document.createElement("div");
    btnWrap.className = "btn-wrap";

    // Horizontal row for "Download Chat" and "Delete Chat"
    const btnRow = document.createElement("div");
    btnRow.className = "btn-row";
    btnRow.appendChild(dlBtn); // Add "Download Chat" button
    btnRow.appendChild(delBtn); // Add "Delete Chat" button

    // Style the full-width "Download Event (.ICS)" button
    icsBtn.className = "full-width-btn";

    // Add the rows to the button container
    btnWrap.appendChild(btnRow);
    btnWrap.appendChild(icsBtn);

    // Append the button container to the chat message
    cMsg.appendChild(btnWrap);

    // Assemble Chat Message
    cMsg.appendChild(userDiv);
    cMsg.appendChild(aiDiv);
    cMsg.appendChild(timeDiv);
    cMsg.appendChild(btnWrap);

    // Prepend to show latest chat at the top
    chatHistoryDiv.prepend(cMsg);
  }

  // Load chat history on startup
  loadChatHistory();
});
