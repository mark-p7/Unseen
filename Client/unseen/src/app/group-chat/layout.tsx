import GroupProvider from "@/context/groupContext";
import SocketProvider from "@/context/socketContext";
import React from "react";


export default function GroupLayout({children,}: { children: React.ReactNode; })
{
    return (
        <GroupProvider>
            <SocketProvider>
                {children}
            </SocketProvider>
        </GroupProvider>
    );
}
