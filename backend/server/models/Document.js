import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
            required: true,
        },
        actionItems: [
            {
                task: String,
                assignee: String,
                deadline: String,
            },
        ],
        decisionPoints: {
            type: [String],
            default: [],
        },
        sentiment: {
            type: String,
            default: "Neutral",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
