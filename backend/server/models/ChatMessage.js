import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
    {
        sender: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
