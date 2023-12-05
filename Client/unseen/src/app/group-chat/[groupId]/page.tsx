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
import Navbar from "@/app/components/navbar";


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

    if (userStatus) {
      socket?.emit("send-message", {
        text: userStatus.username + " joined the group.",
        socketId: "abcd",
        groupId: groupId,
      });
    }

    socket?.emit("enter-group", groupId);
    console.log("printing socket")
    console.log(socket);
    console.log("printing group users")
    console.log(groupUsers)
  }, [socket, userStatus]);


  if (userStatus) {
    return (
      <>
        <Navbar isLoggedIn={userStatus?.loggedIn} />
        <div className="h-[calc(100vh-67px)] w-full">
          <div className="h-full w-full py-10 px-48">
            <h1 className="text-3xl font-bold">Group Chat</h1>
            <div className="flex relative flex-col w-full h-full">
              <ChatHeader groupId={groupId} />
              <ChatBody groupId={groupId} />
              <ChatFooter groupId={groupId} />
            </div>
          </div>
        </div>
      </>
    );
  }

}

export default Page;

