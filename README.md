# API Interaction

<!-- ![Practice Area](clients/business-name/branding/practice_area.png) -->
<img src="clients/business-name/branding/practice_area.png" alt="Logo" height="500" />

**Grok API Interaction** is a modular platform for creating **bespoke Chrome extensions** powered by AI-based chat interfaces. Tailored toward client-specific workflows, this repository streamlines the development and deployment of customized AI-driven extensions for various industries and use cases.

The architecture is designed for **reusability**, **scalability**, and **easy customization**, ensuring that developers can quickly adapt the core solution to suit different clients, branding guidelines, and feature sets.

---

## Key Features

- **Modular Architecture**: A centralized core for logic in `core/` with a plug-and-play structure under `clients/` for tailoring to each client.
- **Flexible AI Backend Integration**: Built-in wrappers for AI services (e.g., OpenAI) to generate responses, summaries, and transformations.
- **Seamless Frontend-Backend Communication**: A `/chat` API endpoint paired with frontend logic (`popup.js`) for intuitive user interactions.
- **Customizable Branding and UI**: Easily swap logos, styles, and configurations per client for white-label solutions.
- **Chat History Management**: Save, view, download, and clear chat histories using local storage.
- **File Upload and Processing**: Users can upload files directly via the extension and process them through AI services (e.g., summarization, key points).
- **Essential AI Utilities for Legal and Corporate Use Cases**:
  - **Document Summarization**: Quickly condense contracts, filings, and case files.
  - **Compliance Automation**: Real-time checklists, regulatory updates, and risk alerts.
  - **Real-Time Legal Research**: Search and retrieve relevant case law, precedents, and keywords instantly.
  - **Task Tracking**: Manage deadlines, calendars, and reminders effectively.
  - **Data Insights**: Generate financial breakdowns, client reports, and actionable trends.
  - **Interactive Tools**: Facilitate drafting policies, analyzing risks, and calculating scenarios.
  - **File Processing**: Enable seamless upload, organization, and parsing of documents.

---

## Project Structure

```markdown
grok-api-interaction-database/
├── .env # Environment variables, including API keys
├── .gitignore # Ensures sensitive files like .env are not committed
├── package.json # Node.js project dependencies & scripts
├── clients/ # Client-specific configurations and assets (unchanged)
│ ├── business-name/
│ │ ├── branding/ # Branding assets (logo, custom styles)
│ │ │ ├── logo.png
│ │ │ └── styles.css
│ │ └── custom.js # Optional client-specific customization logic
├── core/ # Modular core for shared, reusable logic
│ ├── clientMetadata.js # Centralized metadata file for client-specific information (unchanged)
│ ├── ai-service.js # Wrapper for AI interactions (unchanged)
│ ├── calendar-util.js # Function for generating .ics files in a separate module
│ ├── tts-service.js # **NEW** Centralized TTS service for reusable logic
│ └── summarization-service.js
├── templates/ # Templates for UI components and default logic (unchanged)
│ ├── popup.js # Frontend JS for Chrome extension popup
│ └── styles.css # Shared CSS styles for the UI
├── LICENSE
├── manifest.json # Chrome extension manifest (v3)
├── index.html # Main HTML for the Chrome extension popup UI
├── grok-interaction.js # Primary backend script managing AI interactions
└── README.md
```

```scss
┌────────────────────────────────────────────────────┐
│            Start (DOM Loaded)                      │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 1. Setup Utility Functions                         │
│ - generateUniqueId()                               │
│ - removeAILabel(response)                          │
│ - constructPrompt(action, userInput)               │
│ - cleanResponse(response)                          │
│ - formatAndTruncateResponse(message)               │
│ - displayResponse(message)                         │
│ - displayMetadata(metadata)                        │
│ - sanitizeTextForTTS(text)                         │
│ - speakAIResponse(response)                        │
│ - stopTTS()                                        │
│ - userRequestsMetadata(input)                      │
│ - processInput(action, userInput)                  │
│ - saveChatMessageToLocalStorage(message)           │
│ - loadChatHistoryFromLocalStorage()                │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 2. Element References and Event Listeners          │
│ - saveAllChatsButton, overlay triggers             │
│ - fileInput, sendButton, clearHistoryButton, etc.  │
│ - ttsVoiceSelect, ttsSpeedRange                    │
│ - ttsPlayButton, ttsStopButton                     │
│ - Hook LocalStorage methods to appropriate events  │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 3. loadChatHistoryFromLocalStorage() at Startup    │
│ - Fetch saved history from LocalStorage            │
│ - For each chat:                                   │
│   - Build UI of chat message                       │
│   - Prepend to chatHistoryDiv                      │
│ - updateSaveChatsButtonVisibility()                │
│ - scrollTop = 0                                    │
│ - Populate TTS voice dropdown                      │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 4. When User Clicks "Send":                        │
│ - If file is selected, process OCR or file text    │
│ - Else use text input directly                     │
│ - processInput(action, userInput) is called        │
│ - Automatically play AI response via TTS           │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 5. processInput(action, userInput):                │
│ - If userRequestsMetadata(userInput):              │
│ → displayMetadata()                                │
│ → saveChatMessageToLocalStorage(metadata response) │
│                   Else:                            │
│ (1) Build prompt with constructPrompt()            │
│ (2) POST to /chat endpoint on server               │
│ (3) Clean up AI response (remove prompt, etc)      │
│ (4) displayResponse(finalAIResponse)               │
│ (5) speakAIResponse(finalAIResponse)               │
│ (6) saveChatMessageToLocalStorage(AI response)     │
│ (7) loadChatHistoryFromLocalStorage()              │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 6. saveChatMessageToLocalStorage(message):         │
│ - Clean + format data                              │
│ - Generate timestamp                               │
│ - Save chat message to chrome.storage.local        │
│ - Trigger UI updates for chat history              │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 7. loadChatHistoryFromLocalStorage():              │
│ - Retrieve chat data from chrome.storage.local     │
│ - Rebuild UI from retrieved messages               │
│ - Attach "Download Chat" & "Delete Chat" buttons   │
│ - Attach TTS Play/Stop handlers for each chat      │
│ - Optionally limit to the latest 10 messages       │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 8. UI: Clear Chat, Save All Chats, Overlays, etc.  │
│ - Clear Chats: Deletes messages from LocalStorage  │
│ - Save All Chats: Fetches and downloads all chats  │
│ - Update overlays and button states dynamically    │
│ - Enable/Disable TTS Play/Stop buttons dynamically │
└────────────────────────────────────────────────────┘

```
