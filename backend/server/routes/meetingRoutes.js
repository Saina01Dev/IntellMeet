import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
    createMeeting,
    getUserMeetings,
    joinMeeting,
    generateSummary
} from "../controllers/meetingController.js";

const router = express.Router();

router.post("/", protect, createMeeting);

router.get("/", protect, getUserMeetings);

router.post("/join/:roomId", protect, joinMeeting);

router.post("/:roomId/generate-summary", protect, generateSummary);

export default router;