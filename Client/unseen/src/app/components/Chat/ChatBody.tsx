"use client";
import { useSocket } from "@/context/socketContext";
import React, { useEffect, useRef, useState } from "react";

function ChatBody({ groupId }: { groupId: string }) {
  const [typing, setTyping] = useState<string>("");
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { messages, socket } = useSocket();

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket?.on("typing-response", (data) => {
      setTyping(data);
    });
  }, []);

  return (
    <div className="basis-[85%] overflow-y-scroll p-5 w-full flex flex-col gap-2">
      {messages[groupId]?.map((message: any, index: number) =>
        message.socketId === "abcd" ? (
          <div className="flex self-center" key={index}>
            <div className="flex justify-center items-center">
              <p>{message.text}</p>
            </div>
          </div>
        ) : message.socketId === socket?.id ? (
          <div className="flex self-end flex-col items-end" key={index}>
            {message.text && <div className="flex justify-center items-center px-3 py-1 text-white rounded-full rounded-br-none bg-primary">
              <p className="font-sans">{message.text}</p>
            </div>}
          </div>
        ) : (
          <div className="flex gap-2 self-start" key={index}>
            <div className="self-center">
            </div>
            <div>
              <p className="pl-2 text-sm align-bottom">{message.name}</p>
              {message.text && <div className={`px-3 py-1 bg-gray-200 rounded-full ${message.image ? "rounded-bl-none" : "rounded-tl-none"} w-fit`}>
                <p className="font-sans">{message.text}</p>
              </div>}
              <p className="py-2 pl-2 text-xs font-light">
                {new Date(message.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )
      )}
      <div ref={lastMessageRef} className="mt-auto text-slate-500">
        {typing}
      </div>
    </div>
  );
}

export default ChatBody;
