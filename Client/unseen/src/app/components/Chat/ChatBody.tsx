"use client";
import { useSocket } from "@/context/socketContext";
import React, {useContext, useEffect, useRef, useState} from "react";
import { Context } from "@/context/userContext";
import axios from "axios";

function ChatBody({ groupId }: { groupId: string }) {
  const [typing, setTyping] = useState<string>("");
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { messages, socket } = useSocket();
  const [ messageHistory, setMessageHistory ] = useState([]);
  const { userStatus } = useContext(Context);


  useEffect(() => {
    axios.post('/message/getAllFromGroup', {
      groupId: groupId,
    }).then(res => {
      const messagesSortedByDate = res.data.sort((a: { datePosted: string; }, b: { datePosted: string; }) => {
        return Date.parse(a.datePosted) - Date.parse(b.datePosted);
      });
      setMessageHistory(messagesSortedByDate);
    })
  }, [])

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

      { messageHistory?.map((message: any, index: number) =>
        message.socketId === "abcd" ? (
          <div className="flex self-center" key={index}>
            <div className="flex justify-center items-center">
              <p>{message.text}</p>
            </div>
          </div>
        ) : message.user === userStatus.userId ? (
          <div className="flex self-end flex-col items-end" key={index}>
            {message.content && <div className="flex justify-center items-center px-3 py-1 text-white rounded-full rounded-br-none bg-primary">
                <p className="font-sans">{message.content}</p>
            </div>}
          </div>
        ) : (
          <div className="flex gap-2 self-start" key={index}>
            <div className="self-center">
            </div>
            <div>
              <p className="pl-2 text-sm align-bottom">{message.name}</p>
              {message.content && <div className={`px-3 py-1 bg-blue-900 rounded-full ${message.image ? "rounded-bl-none" : "rounded-tl-none"} w-fit`}>
                  <p className="font-sans">{message.content}</p>
              </div>}
              <p className="py-2 pl-2 text-xs font-light">
                {new Date(message.datePosted).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )
      )}

      { messages[groupId]?.map((message: any, index: number) =>
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
              {message.text && <div className={`px-3 py-1 bg-blue-900 rounded-full ${message.image ? "rounded-bl-none" : "rounded-tl-none"} w-fit`}>
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
