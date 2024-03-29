"use client";
import * as socketIO from "socket.io-client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface IMessage {
    text: string;
    name: string;
    id: string;
    socketId: string;
    groupId: string;
    image?: string;
}

interface ISocketContext {
    socket: socketIO.Socket | undefined;
    groupUsers: any;
    messages: { [key: string]: IMessage[] };
}

const initialData: ISocketContext = {
    socket: undefined,
    groupUsers: {},
    messages: {},
};

const SocketContext = createContext<ISocketContext>(initialData);

export function useSocket() {
    return useContext(SocketContext);
}

export default function SocketProvider({ children,}: { children: React.ReactNode; }) {
    const [groupUsers, setGroupUsers] = useState({});
    const [socket, setSocket] = useState<socketIO.Socket>();
    const [messages, setMessages] = useState<{ [key: string]: IMessage[] }>({});

    useEffect(() => {
        // if (!userStatus.username) {
        //     router.replace("/");
        //     return;
        // }
        const socket = socketIO.connect("https://localhost:8080/");
        socket.on("receive-message", (data: IMessage) => {
            console.log(data);
            setMessages((prev) => {
                const newMessages = { ...prev };
                newMessages[data.groupId] = [...(newMessages[data.groupId] ?? []), data];
                return newMessages;
            });
        });
        socket.on("users-response", (data) => setGroupUsers(data));
        setSocket(socket);
    }, []);

    return (
        <SocketContext.Provider value={{ socket, groupUsers, messages }}>
            {children}
        </SocketContext.Provider>
    );
}
