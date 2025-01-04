# Grok API Interaction

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
│ ├── storage-handler.js # Manages Firestore-based storage (modified to replace local storage)
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
│ - userRequestsMetadata(input)                      │
│ - processInput(action, userInput)                  │
│ - saveChatMessageToFirestore(message)              │
│ - loadChatHistoryFromFirestore()                   │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 2. Element References and Event Listeners          │
│ - saveAllChatsButton, overlay triggers             │
│ - fileInput, sendButton, clearHistoryButton, etc.  │
│ - Hook Firestore methods to appropriate events     │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 3. loadChatHistoryFromFirestore() at Startup       │
│ - Fetch saved history from Firestore               │
│ - For each chat:                                   │
│   - Build UI of chat message                       │
│   - Prepend to chatHistoryDiv                      │
│ - updateSaveChatsButtonVisibility()                │
│ - scrollTop = 0                                    │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 4. When User Clicks "Send":                        │
│ - If file is selected, process OCR or file text    │
│ - Else use text input directly                     │
│ - processInput(action, userInput) is called        │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 5. processInput(action, userInput):                │
│ - If userRequestsMetadata(userInput):              │
│ → displayMetadata()                                │
│ → saveChatMessageToFirestore(metadata response)    │
│                   Else:                            │
│ (1) Build prompt with constructPrompt()            │
│ (2) POST to /chat endpoint on server               │
│ (3) Clean up AI response (remove prompt, etc)      │
│ (4) displayResponse(finalAIResponse)               │
│ (5) saveChatMessageToFirestore(AI response)        │
│ (6) loadChatHistoryFromFirestore()                 │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 6. saveChatMessageToFirestore(message):            │
│ - Clean + format data                              │
│ - Generate timestamp                               │
│ - Push chat message to Firestore as a document     │
│ - Trigger UI updates for chat history              │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 7. loadChatHistoryFromFirestore():                 │
│ - Fetch chat data from Firestore                   │
│ - Rebuild UI from retrieved messages               │
│ - Attach "Download Chat" & "Delete Chat" buttons   │
│ - Optionally limit to the latest 10 messages       │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 8. UI: Clear Chat, Save All Chats, Overlays, etc.  │
│ - Clear Chats: Deletes messages from Firestore     │
│ - Save All Chats: Fetches and downloads all chats  │
│ - Update overlays and button states dynamically    │
└────────────────────────────────────────────────────┘
```
