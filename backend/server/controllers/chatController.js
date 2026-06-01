import ChatMessage from "../models/ChatMessage.js";

export const getMessages = async (req, res) => {
    try {
        const messages = await ChatMessage.find().sort({ createdAt: -1 }).limit(100);
        res.json(messages.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
