import mongoose from "mongoose";

const scheduledMeetingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        participants: {
            type: [String],
            default: [],
        },
        meetingLink: {
            type: String,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const ScheduledMeeting = mongoose.model("ScheduledMeeting", scheduledMeetingSchema);

export default ScheduledMeeting;
