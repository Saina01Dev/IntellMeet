import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import scheduledMeetingRoutes from "./routes/scheduledMeetingRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { initializeSocket } from "./sockets/meetingSocket.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
    process.env.CLIENT_URL,
    "https://intellmeet-video-meeting.vercel.app",
    "http://localhost:5173",
    "http://192.168.31.243:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
];

const io = new Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            console.log("origin", origin);
            if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST"]
    },
});

initializeSocket(io);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/scheduled-meetings", scheduledMeetingRoutes);
app.use("/api/settings", settingsRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        httpServer.listen(PORT, () => {
            console.log(`Server running on ${PORT}`);
        });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

startServer();