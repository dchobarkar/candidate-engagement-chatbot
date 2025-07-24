import React from "react";

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
}

export function MessageBubble({
  message,
  isUser,
  timestamp,
}: MessageBubbleProps) {
  return (
    <div className={`message-bubble ${isUser ? "user" : "assistant"}`}>
      {/* TODO: Implement message bubble */}
      <p>{message}</p>
    </div>
  );
}
