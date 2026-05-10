import { useEffect, useRef } from "react";

const VideoPlayer = ({ stream, muted = false }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={muted}
            className="w-full h-full rounded-lg bg-[#111827] object-cover"
            onCanPlay={(e) => e.target.play().catch(err => console.log("Autoplay blocked", err))}
        />
    );
};

export default VideoPlayer;