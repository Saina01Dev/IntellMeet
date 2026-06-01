import { useState, useEffect, useRef } from "react";
import { getMessages } from "../services/chatService";
import { socket } from "../services/socket";

const ChatRoomTab = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const endRef = useRef();
    
    // Get user from local storage directly for simplicity since authService isn't fully robust
    const userString = localStorage.getItem("user");
    let user = { name: "Unknown" };
    try { user = JSON.parse(userString || "{}"); } catch (e) { }

    useEffect(() => {
        getMessages().then(setMessages).catch(console.error);
        
        socket.emit("join-room", "global");
        
        const handleReceive = (msg) => {
            if (msg.roomId === "global") {
                setMessages(prev => [...prev, msg]);
            }
        };
        
        socket.on("receive-message", handleReceive);
        
        return () => {
            socket.off("receive-message", handleReceive);
        };
    }, []);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = () => {
        if (!input.trim()) return;
        socket.emit("send-message", { 
            roomId: "global", 
            sender: user.name, 
            message: input 
        });
        setInput("");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)", padding: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#122056", marginBottom: 20 }}>Global Chat Room</h2>
            
            <div style={{ 
                flex: 1, 
                overflowY: "auto", 
                background: "#FFFFFF", 
                padding: 24, 
                borderRadius: 16, 
                boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px" 
            }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#8B94B1", marginTop: 40 }}>
                        Welcome to the Global Chat! Be the first to say hello.
                    </div>
                ) : (
                    messages.map((m, i) => {
                        const isOwn = m.sender === user.name;
                        return (
                            <div key={m._id || i} style={{ 
                                marginBottom: 16, 
                                display: "flex",
                                flexDirection: "column",
                                alignItems: isOwn ? "flex-end" : "flex-start" 
                            }}>
                                <span style={{ fontSize: 11, color: "#8B94B1", marginBottom: 4, fontWeight: 600 }}>
                                    {m.sender} • {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div style={{ 
                                    background: isOwn ? "#5B65DC" : "#EEEFFD", 
                                    color: isOwn ? "#FFFFFF" : "#122056", 
                                    padding: "12px 16px", 
                                    borderRadius: 16,
                                    borderTopRightRadius: isOwn ? 4 : 16,
                                    borderTopLeftRadius: !isOwn ? 4 : 16,
                                    maxWidth: "75%",
                                    fontSize: 14,
                                    lineHeight: 1.5,
                                    fontWeight: 500
                                }}>
                                    {m.message}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={endRef} />
            </div>
            
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={e => e.key === "Enter" && send()} 
                    placeholder="Type a message..." 
                    style={{ 
                        flex: 1, 
                        padding: "16px 20px", 
                        borderRadius: 14, 
                        border: "1px solid #EEEFFD",
                        background: "#FFFFFF",
                        fontSize: 15,
                        outline: "none"
                    }} 
                />
                <button 
                    onClick={send} 
                    style={{ 
                        padding: "0 32px", 
                        background: "#5B65DC", 
                        color: "#FFFFFF", 
                        borderRadius: 14, 
                        border: "none", 
                        cursor: "pointer",
                        fontWeight: 800,
                        fontSize: 15,
                        transition: "all 0.2s"
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatRoomTab;
