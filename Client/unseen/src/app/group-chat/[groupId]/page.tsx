"use client";
import ChatBody from "@/app/components/Chat/ChatBody";
import ChatFooter from "@/app/components/Chat/ChatFooter";
import ChatHeader from "@/app/components/Chat/ChatHeader";
import { useSocket } from "@/context/socketContext";
import { Context } from "@/context/userContext";
import { useParams } from "next/navigation";
import React, { useContext, useEffect } from "react";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import axios from 'axios';
import { useRouter } from "next/navigation";


interface PageParams extends Params {
  groupId: string;
}

function Page() {
  const { groupId } = useParams<PageParams>();
  const { socket, groupUsers } = useSocket();
  const { userStatus } = useContext(Context);
  axios.defaults.baseURL = 'https://localhost:8080/api';
  const router = useRouter()

  useEffect(() => {
    if (groupUsers[groupId]?.includes(socket?.id)) return;

    axios.post('/getGroup', {
      groupid: groupId
    }).then(res => {
      const groupMembers = res.data.groupMembers;
      axios.post('/getUserId', {
        token: localStorage.getItem('auth-token')
      }).then(res => {
        const userId = res.data;
        if (!groupMembers.includes(userId))
          router.push('/groups');
      })
    }).catch(() => {
      router.push('/groups');
    });

    socket?.emit("send-message", {
      text: userStatus.username + " joined the group.",
      socketId: "abcd",
      groupId: groupId,
    });
    socket?.emit("enter-group", groupId);
    console.log("printing socket")
    console.log(socket);
    console.log("printing group users")
    console.log(groupUsers)
  }, [socket]);


  return (
    <div className="flex relative flex-col w-full h-screen">
        <ChatHeader groupId={groupId} />
        <ChatBody groupId={groupId} />
        <ChatFooter groupId={groupId} />
    </div>
  );
}

export default Page;

