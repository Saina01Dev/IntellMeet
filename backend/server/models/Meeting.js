import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        roomId: {
            type: String,
            required: true,
            unique: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        transcript: {
            type: String,
            default: "",
        },

        summary: {
            type: String,
            default: "",
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
    },
    { timestamps: true }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;