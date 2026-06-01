import express from "express";
import { getMessages } from "../controllers/chatController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/messages").get(protect, getMessages);

export default router;
