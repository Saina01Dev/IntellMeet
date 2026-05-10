const activeUsers = {};

export const initializeSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // JOIN ROOM
        socket.on("join-room", ({ roomId, userId, userName }) => {
            socket.join(roomId);

            if (!activeUsers[roomId]) {
                activeUsers[roomId] = [];
            }

            // Remove stale entry for this socket if re-joining
            activeUsers[roomId] = activeUsers[roomId].filter(u => u.socketId !== socket.id);

            activeUsers[roomId].push({
                socketId: socket.id,
                userId,
                userName: userName || "Participant",
            });

            // Notify existing users — pass the real name so they can display it
            socket.to(roomId).emit("user-joined", {
                socketId: socket.id,
                userId,
                userName: userName || "Participant",
            });

            console.log(`User "${userName}" (socket ${socket.id}) joined room ${roomId}`);
        });

        // OFFER
        socket.on("offer", ({ offer, to }) => {
            io.to(to).emit("offer", {
                offer,
                from: socket.id,
            });
        });

        // ANSWER
        socket.on("answer", ({ answer, to }) => {
            io.to(to).emit("answer", {
                answer,
                from: socket.id,
            });
        });

        // ICE CANDIDATE
        socket.on("ice-candidate", ({ candidate, to }) => {
            io.to(to).emit("ice-candidate", {
                candidate,
                from: socket.id,
            });
        });

        // MESSAGING
        socket.on("send-message", (data) => {
            io.to(data.roomId).emit("receive-message", data);
        });

        // TYPING
        socket.on("typing", (data) => {
            console.log(`Typing event in room ${data.roomId}`);
            socket.to(data.roomId).emit("user-typing", data);
        });

        // DISCONNECT
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);

            for (const roomId in activeUsers) {
                activeUsers[roomId] = activeUsers[roomId].filter(
                    (user) => user.socketId !== socket.id
                );

                socket.to(roomId).emit("user-left", {
                    socketId: socket.id,
                });
            }
        });
    });
};