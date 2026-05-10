import Meeting from "../models/Meeting.js";
import { v4 as uuidv4 } from "uuid";
import { generateMeetingSummary } from "../services/aiService.js";


// Create Meeting
export const createMeeting = async (req, res) => {
    try {

        const { title = "Untitled Meeting" } = req.body;

        const roomId = uuidv4();

        const meeting = await Meeting.create({
            title,
            roomId,
            createdBy: req.user._id,
            participants: [req.user._id],
        });

        res.status(201).json(meeting);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });
    }
};


// Get User Meetings
export const getUserMeetings = async (req, res) => {
    try {

        const meetings = await Meeting.find({
            participants: req.user._id,
        })
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.json(meetings);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });
    }
};


// Join Meeting
export const joinMeeting = async (req, res) => {
    try {

        const { roomId } = req.params;

        const meeting = await Meeting.findOne({ roomId });

        if (!meeting) {
            return res.status(404).json({
                message: "Meeting not found",
            });
        }

        // Add participant if not already joined
        const alreadyJoined = meeting.participants.includes(
            req.user._id
        );

        if (!alreadyJoined) {

            meeting.participants.push(req.user._id);

            await meeting.save();
        }

        res.json(meeting);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });
    }
};

// Generate AI Summary
export const generateSummary = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { transcript } = req.body;

        if (!transcript) {
            return res.status(400).json({ message: "Transcript is required to generate a summary." });
        }

        const meeting = await Meeting.findOne({ roomId });
        
        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        // Must be a participant (or creator) to generate summary
        const isParticipant = meeting.participants.includes(req.user._id);
        if (!isParticipant) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Call AI Service
        const aiResult = await generateMeetingSummary(transcript);

        // Update Meeting Document
        meeting.transcript = transcript;
        meeting.summary = aiResult.summary;
        meeting.actionItems = aiResult.actionItems;
        await meeting.save();

        res.json({
            message: "Summary generated successfully",
            summary: meeting.summary,
            actionItems: meeting.actionItems
        });

    } catch (error) {
        console.error("Generate Summary Error:", error);
        res.status(500).json({ message: error.message || "Failed to generate summary" });
    }
};