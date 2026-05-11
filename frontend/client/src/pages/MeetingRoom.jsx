import EmojiPicker from 'emoji-picker-react';
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import { getCurrentUser } from "../services/authService";
import { socket } from "../services/socket";
import { peerConfig } from "../services/webrtc";


const avatarColors = [
    { bg: "#E6F1FB", text: "#185FA5" },
    { bg: "#E1F5EE", text: "#0F6E56" },
    { bg: "#EEEDFE", text: "#534AB7" },
    { bg: "#FBEAF0", text: "#993556" },
    { bg: "#FAEEDA", text: "#854F0B" },
];
const getAvatarStyle = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];
const getInitials = (name) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
const getSenderColor = (name) => {
    const colors = ["#185FA5", "#0F6E56", "#534AB7", "#993556", "#854F0B"];
    return colors[name.charCodeAt(0) % colors.length];
};
const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });


const Avatar = ({ name, size = 34 }) => {
    const s = getAvatarStyle(name);
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            background: s.bg, color: s.text,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.36, fontWeight: 600, flexShrink: 0, userSelect: "none",
        }}>
            {getInitials(name)}
        </div>
    );
};


const CtrlBtn = ({ onClick, danger, active, children, label }) => (
    <button
        onClick={onClick}
        aria-label={label}
        title={label}
        style={{
            width: 44, height: 44, borderRadius: "12px",
            border: danger ? "none" : active ? `2px solid #5B65DC` : "1px solid #e5e7eb",
            background: danger ? "#FF4D4E" : active ? "#EEEFFD" : "#FFFFFF",
            color: danger ? "#FFFFFF" : active ? "#5B65DC" : "#122056",
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 6px rgba(18, 32, 86, 0.05)",
        }}
    >
        {children}
    </button>
);


const IconMic = ({ muted }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {muted ? (
            <>
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
            </>
        ) : (
            <>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
            </>
        )}
    </svg>
);

const IconCamera = ({ off }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {off ? (
            <>
                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34" />
                <path d="M23 7l-7 5 7 5V7z" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </>
        ) : (
            <>
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </>
        )}
    </svg>
);

const IconPhone = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.43 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.5 9.9a16 16 0 0 0 3.18 3.41z" style={{ transform: "rotate(135deg)", transformOrigin: "center" }} />
    </svg>
);

const IconVolume = () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
);

const IconExpand = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
);

const IconSend = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const IconBack = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const IconScreenShare = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="m17 2 5 5-5 5" />
        <path d="M22 7h-9" />
    </svg>
);


const MeetingRoom = () => {
    const { roomId } = useParams();

    const currentUser = getCurrentUser();
    const myName = currentUser.name || "You";

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState("");
    const [localStream, setLocalStream] = useState(null);
    const [remoteParticipants, setRemoteParticipants] = useState({}); // socketId -> { stream, userName, isCameraOff, isMuted }
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [mediaError, setMediaError] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [activeTab, setActiveTab] = useState("chat");

    const addToast = (msg) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const peersRef = useRef({}); // socketId -> RTCPeerConnection
    const localStreamRef = useRef(null);
    const pendingCandidatesRef = useRef({}); // socketId -> [candidates]
    const joinedRef = useRef(false);


    useEffect(() => {
        socket.on("receive-message", (data) => {
            setMessages((prev) => [...prev, { ...data, time: new Date() }]);
        });
        socket.on("user-typing", (data) => {
            setTyping(data.message);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setTyping(""), 3000);
        });
        return () => {
            socket.off("receive-message");
            socket.off("user-typing");
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, []);




    useEffect(() => {
        return () => {
            console.log("[Meeting] Component unmounting, cleaning up...");
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((t) => t.stop());
            }
            Object.values(peersRef.current).forEach(peer => peer.close());
            peersRef.current = {};
        };
    }, []);


    useEffect(() => {
        if (joinedRef.current) return;
        joinedRef.current = true;

        let stream = null;
        const getMedia = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("Browser not supported");
                }
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            } catch (err) {
                console.warn("Video+Audio failed, trying Audio only", err);
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    setIsCameraOff(true);
                } catch (audioErr) {
                    console.error("Media error (all failed):", audioErr);
                    setMediaError(audioErr.name === "NotAllowedError"
                        ? "Camera/Mic access denied. You joined as a viewer."
                        : "Could not access hardware. You joined as a viewer.");
                    setIsCameraOff(true);
                    setIsMuted(true);
                }
            }

            if (stream) {
                setLocalStream(stream);
                localStreamRef.current = stream;
            }


            console.log(`[Meeting] Joining room ${roomId} as "${myName}"`);
            socket.emit("join-room", { roomId, userId: socket.id, userName: myName });
        };
        getMedia();
        return () => stream?.getTracks().forEach((t) => t.stop());
    }, [roomId]);


    useEffect(() => {
        const createPeer = (targetSocketId, userName) => {
            console.log(`[WebRTC] Creating peer connection for ${targetSocketId} (${userName})`);
            const peer = new RTCPeerConnection(peerConfig);
            peersRef.current[targetSocketId] = peer;

            peer.oniceconnectionstatechange = () => {
                console.log(`[WebRTC] ICE Connection State for ${targetSocketId}:`, peer.iceConnectionState);
                if (peer.iceConnectionState === "disconnected" || peer.iceConnectionState === "failed") {
                    handleUserLeft({ socketId: targetSocketId });
                }
            };

            peer.onsignalingstatechange = () => {
                console.log(`[WebRTC] Signaling State for ${targetSocketId}:`, peer.signalingState);
            };

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((t) => {
                    console.log(`[WebRTC] Adding local track (${t.kind}) to peer ${targetSocketId}`);
                    peer.addTrack(t, localStreamRef.current);
                });
            }

            peer.ontrack = (e) => {
                console.log(`[WebRTC] Received remote track (${e.track.kind}) from ${targetSocketId}`);
                const stream = e.streams && e.streams[0] ? e.streams[0] : new MediaStream([e.track]);
                
                setRemoteParticipants(prev => ({
                    ...prev,
                    [targetSocketId]: {
                        ...prev[targetSocketId],
                        stream,
                        userName: userName || prev[targetSocketId]?.userName || "Participant"
                    }
                }));
            };

            peer.onicecandidate = (e) => {
                if (e.candidate) {
                    console.log("[WebRTC] Sending ICE candidate to", targetSocketId);
                    socket.emit("ice-candidate", { candidate: e.candidate, to: targetSocketId });
                }
            };

            return peer;
        };

        const handleUserJoined = async ({ socketId, userName }) => {
            console.log(`[Meeting] User joined: "${userName}" (${socketId})`);
            addToast(`${userName || "A participant"} joined the meeting`);
            
            setRemoteParticipants(prev => ({
                ...prev,
                [socketId]: { userName, stream: null }
            }));

            const peer = createPeer(socketId, userName);
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            console.log("[WebRTC] Sending offer to", socketId);
            socket.emit("offer", { offer, to: socketId, userName: myName });
        };

        const handleOffer = async ({ offer, from, userName }) => {
            console.log("[WebRTC] Received offer from", from);
            
            let peer = peersRef.current[from];
            if (!peer) {
                peer = createPeer(from, userName);
                setRemoteParticipants(prev => ({
                    ...prev,
                    [from]: { userName: userName || "Participant", stream: null }
                }));
            }

            try {
                await peer.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                console.log("[WebRTC] Sending answer to", from);
                socket.emit("answer", { answer, to: from, userName: myName });

                // Process queued candidates
                if (pendingCandidatesRef.current[from]) {
                    console.log(`[WebRTC] Processing queued candidates for ${from}`);
                    pendingCandidatesRef.current[from].forEach(async (candidate) => {
                        await peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error("Error adding queued candidate", e));
                    });
                    delete pendingCandidatesRef.current[from];
                }
            } catch (err) {
                console.error("[WebRTC] Error handling offer:", err);
            }
        };

        const handleAnswer = async ({ answer, from, userName }) => {
            console.log("[WebRTC] Received answer from", from);
            const peer = peersRef.current[from];
            if (peer) {
                try {
                    setRemoteParticipants(prev => ({
                        ...prev,
                        [from]: {
                            ...prev[from],
                            userName: userName || prev[from]?.userName || "Participant"
                        }
                    }));
                    await peer.setRemoteDescription(new RTCSessionDescription(answer));
                    
                    // Process queued candidates
                    if (pendingCandidatesRef.current[from]) {
                        console.log(`[WebRTC] Processing queued candidates for ${from}`);
                        pendingCandidatesRef.current[from].forEach(async (candidate) => {
                            await peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error("Error adding queued candidate", e));
                        });
                        delete pendingCandidatesRef.current[from];
                    }
                } catch (err) {
                    console.error("[WebRTC] Error handling answer:", err);
                }
            }
        };

        const handleIceCandidate = async ({ candidate, from }) => {
            const peer = peersRef.current[from];
            if (peer && peer.remoteDescription) {
                try {
                    await peer.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("[WebRTC] Error adding ICE candidate", e);
                }
            } else {
                console.log(`[WebRTC] Queuing ICE candidate from ${from}`);
                if (!pendingCandidatesRef.current[from]) pendingCandidatesRef.current[from] = [];
                pendingCandidatesRef.current[from].push(candidate);
            }
        };

        const handleUserLeft = ({ socketId }) => {
            console.log(`[Meeting] User left: ${socketId}`);
            if (peersRef.current[socketId]) {
                peersRef.current[socketId].close();
                delete peersRef.current[socketId];
            }
            setRemoteParticipants(prev => {
                const updated = { ...prev };
                const userName = updated[socketId]?.userName;
                if (userName) addToast(`${userName} left the meeting`);
                delete updated[socketId];
                return updated;
            });
            delete pendingCandidatesRef.current[socketId];
        };

        const handleUserMediaState = ({ socketId, isCameraOff, isMuted }) => {
            console.log(`[Meeting] Media state update from ${socketId}: camera=${isCameraOff}, muted=${isMuted}`);
            setRemoteParticipants(prev => {
                if (!prev[socketId]) return prev;
                return {
                    ...prev,
                    [socketId]: {
                        ...prev[socketId],
                        isCameraOff,
                        isMuted
                    }
                };
            });
        };

        socket.on("user-joined", handleUserJoined);
        socket.on("offer", handleOffer);
        socket.on("answer", handleAnswer);
        socket.on("ice-candidate", handleIceCandidate);
        socket.on("user-left", handleUserLeft);
        socket.on("user-media-state", handleUserMediaState);

        return () => {
            socket.off("user-joined", handleUserJoined);
            socket.off("offer", handleOffer);
            socket.off("answer", handleAnswer);
            socket.off("ice-candidate", handleIceCandidate);
            socket.off("user-left", handleUserLeft);
            socket.off("user-media-state", handleUserMediaState);
        };
    }, [myName]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);


    const sendMessage = () => {
        if (!message.trim()) return;

        socket.emit("send-message", { roomId, message, senderId: socket.id, sender: myName });
        setMessage("");
        inputRef.current?.focus();
    };

    const handleTyping = () => socket.emit("typing", { roomId, message: `${myName} is typing...` });

    const toggleCamera = async () => {
        if (!isCameraOff) {
            console.log("[Media] Turning camera OFF");
            const track = localStreamRef.current?.getVideoTracks()[0];
            if (track) {
                track.stop();
            }
            setIsCameraOff(true);
            socket.emit("media-state-change", { roomId, isCameraOff: true, isMuted });
        } else {
            try {
                console.log("[Media] Turning camera ON");
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const newTrack = stream.getVideoTracks()[0];

                const audioTracks = localStreamRef.current ? localStreamRef.current.getAudioTracks() : [];
                const newStream = new MediaStream([newTrack, ...audioTracks]);

                setLocalStream(newStream);
                localStreamRef.current = newStream;

                Object.values(peersRef.current).forEach(async (peer) => {
                    const sender = peer.getSenders().find(s => s.track && s.track.kind === 'video');
                    if (sender) {
                        await sender.replaceTrack(newTrack);
                    } else {
                        peer.addTrack(newTrack, newStream);
                    }
                });

                setIsCameraOff(false);
                socket.emit("media-state-change", { roomId, isCameraOff: false, isMuted });
            } catch (err) {
                console.error("Could not restart camera", err);
                addToast("Could not access camera");
            }
        }
    };

    const toggleMute = () => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
            socket.emit("media-state-change", { roomId, isCameraOff, isMuted: !track.enabled });
        }
    };

    const leaveRoom = () => {
        console.log("[Meeting] Leaving room...");
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => t.stop());
        }
        Object.values(peersRef.current).forEach(peer => peer.close());
        window.location.href = "/";
    };

    const startScreenShare = async () => {
        try {
            console.log("[Media] Starting screen share");
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];

            Object.values(peersRef.current).forEach(async (peer) => {
                const sender = peer.getSenders().find((s) => s.track?.kind === "video");
                if (sender) await sender.replaceTrack(screenTrack);
            });

            const updatedStream = new MediaStream([
                screenTrack,
                ...localStreamRef.current.getAudioTracks(),
            ]);
            setLocalStream(updatedStream);
            setIsScreenSharing(true);

            screenTrack.onended = () => stopScreenShare();
        } catch (err) {
            console.error("Screen share error:", err);
        }
    };

    const stopScreenShare = async () => {
        console.log("[Media] Stopping screen share");
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
        
        Object.values(peersRef.current).forEach(async (peer) => {
            const sender = peer.getSenders().find((s) => s.track?.kind === "video");
            if (sender && cameraTrack) await sender.replaceTrack(cameraTrack);
        });

        const restoredStream = new MediaStream([
            cameraTrack,
            ...localStreamRef.current.getAudioTracks(),
        ]);
        setLocalStream(restoredStream);
        setIsScreenSharing(false);
    };


    return (
        <div style={css.root}>
            <style>{globalCSS}</style>

            {toasts.length > 0 && (
                <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
                    {toasts.map(t => (
                        <div key={t.id} style={{ background: "#122056", color: "#FFF", padding: "12px 24px", borderRadius: "8px", fontSize: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", animation: "fadeIn 0.3s ease" }}>
                            {t.msg}
                        </div>
                    ))}
                </div>
            )}

            <aside style={css.sidebar}>
                <div style={css.logoArea}>
                    <div style={css.logoIcon}>
                        <img src="/favicon.png" alt="Logo" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                    </div>
                </div>
                <div style={css.sideNav}>
                    {["home", "video", "doc", "chat", "bell", "settings"].map((icon, i) => (
                        <button key={icon} style={{ ...css.sideBtn, ...(icon === "video" ? css.sideBtnActive : {}) }}>
                            {icon === "home" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>}
                            {icon === "video" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>}
                            {icon === "doc" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>}
                            {icon === "chat" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                            {icon === "bell" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>}
                            {icon === "settings" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>}
                        </button>
                    ))}
                </div>
                <button onClick={leaveRoom} style={css.sideExit}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                </button>
            </aside>

            <main style={css.main}>
                <header style={css.header}>
                    <div style={css.headerLeft}>
                        <div style={css.timeMeta}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <h1 style={css.roomTitle}>Meeting Session</h1>
                    </div>
                    <div style={css.headerRight}>
                        <div style={css.userPill}>
                            <Avatar name={myName} size={28} />
                            <span style={css.userName}>{myName}</span>
                        </div>
                    </div>
                </header>

                <div style={css.content}>
                    <div style={css.participantGrid}>
                        {/* Local Video */}
                        <div style={css.videoWrapper}>
                            {localStream && !isCameraOff ? (
                                <VideoPlayer stream={localStream} muted />
                            ) : (
                                <div style={css.mainPlaceholder}>
                                    <Avatar name={myName} size={100} />
                                    <p style={css.placeholderText}>{mediaError || "Your camera is off"}</p>
                                </div>
                            )}
                            <div style={css.mainLabel}>
                                <div style={css.statusDot} />
                                {myName} (You)
                            </div>
                        </div>

                        {/* Remote Videos */}
                        {Object.entries(remoteParticipants).map(([socketId, participant]) => (
                            <div key={socketId} style={css.videoWrapper}>
                                {participant.stream && participant.stream.getVideoTracks().length > 0 ? (
                                    <VideoPlayer stream={participant.stream} />
                                ) : (
                                    <div style={css.mainPlaceholder}>
                                        <Avatar name={participant.userName || "Participant"} size={100} />
                                        <p style={css.placeholderText}>{participant.userName || "Participant"}'s camera is off</p>
                                    </div>
                                )}
                                <div style={css.mainLabel}>
                                    <div style={css.statusDot} />
                                    {participant.userName || "Participant"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                    <footer style={css.controlPill}>
                        <div style={css.roomIdBox}>
                            <span style={css.roomLabel}>Meeting ID</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={css.roomValue}>{roomId}</span>
                                <button onClick={() => { navigator.clipboard.writeText(roomId); addToast("Meeting ID copied!"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#5B65DC", padding: 4, display: "flex", alignItems: "center" }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                </button>
                            </div>
                        </div>
                        <div style={css.btnGroup}>
                            <CtrlBtn onClick={toggleMute} active={!isMuted} label={isMuted ? "Unmute" : "Mute"}>
                                <IconMic muted={isMuted} />
                            </CtrlBtn>
                            <CtrlBtn onClick={toggleCamera} active={!isCameraOff} label={isCameraOff ? "Camera On" : "Camera Off"}>
                                <IconCamera off={isCameraOff} />
                            </CtrlBtn>
                            <CtrlBtn onClick={isScreenSharing ? stopScreenShare : startScreenShare} active={isScreenSharing} label={isScreenSharing ? "Stop Sharing" : "Share Screen"}>
                                <IconScreenShare />
                            </CtrlBtn>
                            <CtrlBtn label="More"><IconExpand /></CtrlBtn>
                        </div>
                        <button onClick={leaveRoom} style={css.endCallBtn}>
                            End Call
                        </button>
                    </footer>
                </div>
            </main>

            <aside style={css.chatContainer}>
                <div style={css.panelHeader}>
                    <button 
                        onClick={() => setActiveTab("chat")}
                        style={{ ...css.tab, ...(activeTab === "chat" ? css.tabActive : {}) }}
                    >
                        Chat
                    </button>
                    <button 
                        onClick={() => setActiveTab("participants")}
                        style={{ ...css.tab, ...(activeTab === "participants" ? css.tabActive : {}) }}
                    >
                        Participants ({Object.keys(remoteParticipants).length + 1})
                    </button>
                </div>

                {activeTab === "chat" ? (
                    <div style={css.chatList}>
                        {messages.length === 0 && (
                            <div style={css.chatEmpty}>No messages yet. Send a greeting to the group.</div>
                        )}
                        {messages.map((msg, i) => {
                            const isOwn = msg.senderId === socket.id;
                            const sender = msg.sender || "Participant";
                            return (
                                <div key={i} style={{ ...css.msgGroup, alignItems: isOwn ? "flex-end" : "flex-start" }}>
                                    {!isOwn && <div style={css.msgSender}>{sender}</div>}
                                    <div style={isOwn ? css.bubbleOwn : css.bubbleOther}>
                                        {msg.message}
                                    </div>
                                    <div style={css.msgMeta}>{msg.time ? formatTime(new Date(msg.time)) : ""}</div>
                                </div>
                            );
                        })}
                        {typing && <div style={css.typingIndicator}>{typing}</div>}
                        <div ref={messagesEndRef} />
                    </div>
                ) : (
                    <div style={css.participantList}>
                        <div style={css.participantItem}>
                            <Avatar name={myName} size={32} />
                            <div style={css.participantInfo}>
                                <div style={css.participantName}>{myName} (You)</div>
                                <div style={css.participantStatus}>Host</div>
                            </div>
                        </div>
                        {Object.entries(remoteParticipants).map(([id, p]) => (
                            <div key={id} style={css.participantItem}>
                                <Avatar name={p.userName || "Participant"} size={32} />
                                <div style={css.participantInfo}>
                                    <div style={css.participantName}>{p.userName || "Participant"}</div>
                                    <div style={css.participantStatus}>Participant</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={css.chatInputArea}>
                    <div style={{ position: "relative" }}>
                        <button onClick={() => setShowEmoji(!showEmoji)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", height: 48, width: 40, color: "#8B94B1" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                        </button>
                        {showEmoji && (
                            <div style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: 8, zIndex: 100 }}>
                                <EmojiPicker onEmojiClick={(e) => { setMessage(prev => prev + e.emoji); setShowEmoji(false); }} theme="light" />
                            </div>
                        )}
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                        onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                        placeholder="Send a message..."
                        style={css.chatInput}
                    />
                    <button onClick={sendMessage} style={css.chatSendBtn}>
                        <IconSend />
                    </button>
                </div>
            </aside>
        </div>
    );
};


const globalCSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  body {
    background: #FAFAFD;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #122056;
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }
  .pulse { animation: pulse 2s infinite ease-in-out; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  video {
    width: 100%; height: 100%;
    object-fit: cover;
    border-radius: 20px;
    display: block;
    background: #122056;
  }


  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
`;

const css = {
    root: {
        display: "flex",
        height: "100vh",
        background: "#FAFAFD",
        overflow: "hidden",
    },


    sidebar: {
        width: 80,
        background: "#122056",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 0",
        flexShrink: 0,
        zIndex: 10,
        boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
    },
    logoArea: { marginBottom: 40 },
    logoIcon: {
        width: 40, height: 40,
        borderRadius: "12px",
        background: "#5B65DC",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 10px rgba(91, 101, 220, 0.3)",
    },
    sideNav: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 16,
    },
    sideBtn: {
        width: 48, height: 48,
        borderRadius: "14px",
        border: "none",
        background: "transparent",
        color: "rgba(255,255,255,0.4)",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
    },
    sideBtnActive: {
        background: "rgba(255,255,255,0.1)",
        color: "#FFFFFF",
    },
    sideExit: {
        width: 48, height: 48,
        borderRadius: "14px",
        border: "none",
        background: "rgba(255,77,78,0.1)",
        color: "#FF4D4E",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
    },


    main: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
    },
    header: {
        height: 72,
        padding: "0 32px",
        background: "#FFFFFF",
        borderBottom: "1px solid #EEEFFD",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
    },
    timeMeta: { fontSize: 12, color: "#8B94B1", fontWeight: 600, marginBottom: 2 },
    roomTitle: { fontSize: 20, fontWeight: 700, color: "#122056", letterSpacing: "-0.5px" },
    userPill: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 12px",
        borderRadius: "12px",
        background: "#FAFAFD",
        border: "1px solid #EEEFFD",
    },
    userName: { fontSize: 13, fontWeight: 600, color: "#122056" },

    content: {
        flex: 1,
        padding: "24px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        overflowY: "auto",
    },

    thumbStrip: {
        display: "flex",
        gap: 16,
    },
    thumbCard: {
        width: 180, height: 110,
        borderRadius: "20px",
        overflow: "hidden",
        background: "#FFFFFF",
        border: "1px solid #EEEFFD",
        position: "relative",
        boxShadow: "0 4px 10px rgba(18, 32, 86, 0.03)",
    },
    thumbPlaceholder: {
        width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#EEEFFD",
    },
    thumbLabel: {
        position: "absolute", bottom: 8, left: 8,
        background: "rgba(18, 32, 86, 0.6)",
        backdropFilter: "blur(4px)",
        color: "#FFFFFF", fontSize: 11, fontWeight: 600,
        padding: "3px 8px", borderRadius: "6px",
    },
    pulseSmall: { width: 12, height: 12, borderRadius: "50%", background: "#5B65DC" },

    participantGrid: {
        flex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 20,
        overflowY: "auto",
        padding: "4px",
    },
    videoWrapper: {
        background: "#122056",
        borderRadius: "24px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(18, 32, 86, 0.1)",
        aspectRatio: "16/9",
    },
    mainPlaceholder: {
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 16,
    },
    placeholderText: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500 },
    mainLabel: {
        position: "absolute", bottom: 16, left: 16,
        background: "rgba(18, 32, 86, 0.5)",
        backdropFilter: "blur(8px)",
        color: "#FFFFFF", padding: "6px 12px",
        borderRadius: "10px", fontSize: 12, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 6,
    },
    statusDot: { width: 6, height: 6, borderRadius: "50%", background: "#10B981" },

    controlPill: {
        height: 80,
        background: "#FFFFFF",
        borderRadius: "24px",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px, 0 10px 30px rgba(18, 32, 86, 0.05)",
    },
    roomIdBox: {
        display: "flex", flexDirection: "column", gap: 2,
    },
    roomLabel: { fontSize: 10, color: "#8B94B1", fontWeight: 700, textTransform: "uppercase" },
    roomValue: { fontSize: 14, color: "#122056", fontWeight: 700, fontFamily: "monospace" },
    btnGroup: { display: "flex", gap: 12 },
    endCallBtn: {
        padding: "12px 24px",
        borderRadius: "12px",
        background: "#FF4D4E",
        color: "#FFFFFF",
        border: "none",
        fontSize: 14, fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 4px 12px rgba(255, 77, 78, 0.2)",
    },


    chatContainer: {
        width: 360,
        background: "#FFFFFF",
        borderLeft: "1px solid #EEEFFD",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
    },
    panelHeader: {
        padding: "24px 24px 16px",
        display: "flex",
        gap: 20,
        borderBottom: "1px solid #FAFAFD",
    },
    tab: {
        fontSize: 14, fontWeight: 700, color: "#8B94B1",
        background: "none", border: "none", cursor: "pointer",
        paddingBottom: 8, position: "relative",
    },
    tabActive: {
        color: "#5B65DC",
    },
    chatList: {
        flex: 1,
        overflowY: "auto",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
    },
    chatEmpty: { textAlign: "center", color: "#8B94B1", fontSize: 13, marginTop: 40 },
    participantList: {
        flex: 1,
        overflowY: "auto",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
    },
    participantItem: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 0",
    },
    participantInfo: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
    },
    participantName: {
        fontSize: 14,
        fontWeight: 600,
        color: "#122056",
    },
    participantStatus: {
        fontSize: 11,
        color: "#8B94B1",
    },
    msgGroup: { display: "flex", flexDirection: "column", gap: 4 },
    msgSender: { fontSize: 11, fontWeight: 700, color: "#8B94B1", marginLeft: 4 },
    bubbleOther: {
        background: "#FAFAFD",
        color: "#122056",
        padding: "12px 16px",
        borderRadius: "0 16px 16px 16px",
        fontSize: 14, lineHeight: 1.5,
        maxWidth: "85%",
        border: "1px solid #EEEFFD",
    },
    bubbleOwn: {
        background: "#5B65DC",
        color: "#FFFFFF",
        padding: "12px 16px",
        borderRadius: "16px 16px 0 16px",
        fontSize: 14, lineHeight: 1.5,
        maxWidth: "85%",
    },
    msgMeta: { fontSize: 10, color: "#8B94B1", marginTop: 4, marginHorizontal: 4 },
    typingIndicator: { fontSize: 12, color: "#5B65DC", fontStyle: "italic", padding: "0 24px" },
    chatInputArea: {
        padding: "24px",
        borderTop: "1px solid #EEEFFD",
        display: "flex",
        gap: 12,
    },
    chatInput: {
        flex: 1,
        height: 48,
        background: "#FAFAFD",
        border: "1px solid #EEEFFD",
        borderRadius: "14px",
        padding: "0 16px",
        fontSize: 14,
        color: "#122056",
        outline: "none",
    },
    chatSendBtn: {
        width: 48, height: 48,
        borderRadius: "14px",
        background: "#5B65DC",
        color: "#FFFFFF",
        border: "none",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 10px rgba(91, 101, 220, 0.2)",
    },
};

export default MeetingRoom;