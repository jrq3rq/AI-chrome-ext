// core/storage-handler.js
const ChatHistory = require("./models/ChatHistory");
const LawFirm = require("./models/LawFirm");
const logger = require("./logger");

/**
 * Save a chat history entry to MongoDB.
 * @param {String} firmId - Unique identifier for the law firm.
 * @param {Object} chat - Chat object containing userMessage, aiResponse, action.
 */
const saveChatHistory = async (firmId, chat) => {
  try {
    const newChat = new ChatHistory({
      firmId,
      userMessage: chat.userMessage,
      aiResponse: chat.aiResponse,
      action: chat.action,
      timestamp: chat.timestamp || new Date(),
    });
    await newChat.save();
    logger.info(`Chat saved for firmId: ${firmId}`);
  } catch (error) {
    logger.error("Error saving chat history:", error);
    throw error;
  }
};

/**
 * Retrieve chat histories for a specific law firm.
 * @param {String} firmId - Unique identifier for the law firm.
 * @param {Number} limit - Number of chat records to retrieve.
 * @param {Number} offset - Pagination offset.
 * @returns {Array} - Array of chat history objects.
 */
const getChatHistories = async (firmId, limit = 100, offset = 0) => {
  try {
    const chats = await ChatHistory.find({ firmId })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
    return chats;
  } catch (error) {
    logger.error("Error retrieving chat histories:", error);
    throw error;
  }
};

/**
 * Delete a specific chat history entry.
 * @param {String} firmId - Unique identifier for the law firm.
 * @param {String} chatId - Unique identifier for the chat.
 * @returns {Boolean} - True if deletion was successful.
 */
const deleteChatHistory = async (firmId, chatId) => {
  try {
    const result = await ChatHistory.deleteOne({ _id: chatId, firmId });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error("Error deleting chat history:", error);
    throw error;
  }
};

/**
 * Export all chat histories for a specific law firm.
 * @param {String} firmId - Unique identifier for the law firm.
 * @returns {Array} - Array of chat history objects.
 */
const exportChatHistories = async (firmId) => {
  try {
    const chats = await ChatHistory.find({ firmId }).lean();
    return chats;
  } catch (error) {
    logger.error("Error exporting chat histories:", error);
    throw error;
  }
};

/**
 * Import chat histories for a specific law firm.
 * @param {String} firmId - Unique identifier for the law firm.
 * @param {Array} chats - Array of chat history objects to import.
 */
const importChatHistories = async (firmId, chats) => {
  try {
    const chatDocs = chats.map((chat) => ({
      firmId,
      userMessage: chat.userMessage,
      aiResponse: chat.aiResponse,
      action: chat.action,
      timestamp: chat.timestamp ? new Date(chat.timestamp) : new Date(),
    }));
    await ChatHistory.insertMany(chatDocs);
    logger.info(`Imported ${chats.length} chats for firmId: ${firmId}`);
  } catch (error) {
    logger.error("Error importing chat histories:", error);
    throw error;
  }
};

module.exports = {
  saveChatHistory,
  getChatHistories,
  deleteChatHistory,
  exportChatHistories,
  importChatHistories,
};
