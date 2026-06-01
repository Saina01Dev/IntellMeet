import ScheduledMeeting from "../models/ScheduledMeeting.js";
import { v4 as uuidv4 } from "uuid";

export const getScheduledMeetings = async (req, res) => {
    try {
        const meetings = await ScheduledMeeting.find({ createdBy: req.user._id }).sort({ date: 1, time: 1 });
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createScheduledMeeting = async (req, res) => {
    try {
        const { title, date, time, participants } = req.body;
        
        const meetingLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/meeting/${uuidv4()}`;

        const meeting = await ScheduledMeeting.create({
            title,
            date,
            time,
            participants: participants || [],
            meetingLink,
            createdBy: req.user._id,
        });
        res.status(201).json(meeting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteScheduledMeeting = async (req, res) => {
    try {
        const meeting = await ScheduledMeeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        if (meeting.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await meeting.deleteOne();
        res.json({ message: "Meeting removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
