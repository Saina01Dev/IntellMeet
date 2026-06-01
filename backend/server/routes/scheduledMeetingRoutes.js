import express from "express";
import { getScheduledMeetings, createScheduledMeeting, deleteScheduledMeeting } from "../controllers/scheduledMeetingController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getScheduledMeetings).post(protect, createScheduledMeeting);
router.route("/:id").delete(protect, deleteScheduledMeeting);

export default router;
