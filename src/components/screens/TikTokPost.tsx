import { useState, useRef, useEffect } from "react";
import {
    Heart,
    MessageCircle,
    Share,
    BookmarkIcon,
    Music,
    User,
} from "lucide-react";

export default function TikTokPreview({
    username = "@username",
    caption = "Check out this awesome video! #trending",
    videoUrl = "/api/placeholder/400/700",
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(1234);
    const videoRef = useRef(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    };

    // Auto-play when component loads
    useEffect(() => {
        const playAttempt = videoRef.current?.play();

        if (playAttempt) {
            playAttempt.catch((e) => {
                console.log("Auto-play prevented:", e);
            });
        }
    }, []);

    return (
        <div className="flex justify-center items-center w-full h-full bg-gray-900 py-6">
            <div className="relative bg-black w-80 h-full max-h-[600px] rounded-lg overflow-hidden">
                {/* Video Container */}
                <div className="relative w-full h-full" onClick={togglePlay}>
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                    />

                    {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-16 border-l-white border-b-8 border-b-transparent ml-1"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side Icons */}
                <div className="absolute right-2 bottom-32 flex flex-col items-center space-y-4">
                    <div className="flex flex-col items-center">
                        <button
                            onClick={handleLike}
                            className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
                        >
                            <Heart
                                className={`${
                                    liked
                                        ? "text-red-500 fill-red-500"
                                        : "text-white"
                                }`}
                                size={24}
                            />
                        </button>
                        <span className="text-white text-xs mt-1">
                            {likeCount}
                        </span>
                    </div>

                    <div className="flex flex-col items-center">
                        <button className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <MessageCircle className="text-white" size={24} />
                        </button>
                        <span className="text-white text-xs mt-1">842</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <button className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <BookmarkIcon className="text-white" size={24} />
                        </button>
                        <span className="text-white text-xs mt-1">Save</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <button className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <Share className="text-white" size={24} />
                        </button>
                        <span className="text-white text-xs mt-1">Share</span>
                    </div>
                </div>

                {/* Username and Caption */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-2">
                            <User className="text-white" size={16} />
                        </div>
                        <p className="text-white font-semibold text-sm">
                            {username}
                        </p>
                    </div>

                    <p className="text-white text-sm mt-2">{caption}</p>

                    <div className="flex items-center mt-2">
                        <Music className="text-white" size={14} />
                        <p className="text-white text-xs ml-2">
                            Original Sound - {username}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
