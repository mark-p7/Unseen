"use client";
import { useSocket } from "@/context/socketContext";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Input } from "@/app/components/ui/input";
import { Modal } from "@/app/components/modal";
import { Button } from "@/app/components/ui/button";

function ChatBody({ groupId }: { groupId: string }) {
  const router = useRouter()
  const [typing, setTyping] = useState<string>("");
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { messages, socket } = useSocket();
  const [isSendInviteModalOpen, setIsSendInviteModalOpen] = useState<boolean>(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState<boolean>(false);
  const [isDisplayMembersModalOpen, setIsDisplayMembersModalOpen] = useState<boolean>(false);
  const [isMessageDeleteModalOpen, setIsMessageDeleteModalOpen] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [groupMembers, setGroupMembers] = useState([""]);
  const [groupName, setGroupName] = useState(groupId);
  const [deleteTime, setDeleteTime] = useState<number>(0);
  const [isGroupOwner, setIsGroupOwner] = useState<boolean>(false);


  useEffect(() => {
    const getMessages = async () => {
      await axios.post('/message/getAllFromGroup', {
        groupId: groupId,
      })
    }
    getMessages().then(res => {

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

  useEffect(() => {
    axios.post('/getGroup', {
      groupid: groupId
    }).then(res => {
      console.log(res.data);
      setGroupName(res.data);
    });
  }, [])

  useEffect(() => {
    axios.post('/getGroupMembers', {
      groupid: groupId
    }).then(res => {
      setGroupMembers(res.data);
      console.log(res.data);
    });
  }, [])

  const InviteModalContent = () => {

    const sendInvite = async () => {
      await axios.post('/sendInvite', {
        username: username, groupId: groupId, token: localStorage.getItem('auth-token')
      }).then(res => {
        console.log(res.data);
        setIsSendInviteModalOpen(false);
      }).catch(err => {
        console.log(err);
      });
    }

    const onKeyDownHandler = (key: String) => {
      if (key === 'Enter') {
        sendInvite();
      }
    };

    return (
      <div className="flex flex-col gap-4 p-11">
        <Input className="border-2 border-black rounded-md px-2 py-1" type="text" placeholder="Username" required min={1} max={15}
          onKeyDown={event => onKeyDownHandler(event.key)} onChange={event => setUsername(event.target.value)} autoFocus />
        <Button className="border-2 border-black rounded-md px-2 py-1" onClick={sendInvite}>Send Invite</Button>
      </div>
    )
  }

  const RemoveModalContent = () => {

    const removeFromGroup = async () => {
      await axios.post('/removeMember', {
        groupid: groupId, username: username, token: localStorage.getItem('auth-token')
      }).then(res => {
        console.log(res);
        setIsRemoveMemberModalOpen(false);
      }).catch(err => {
        console.log(err);
      })
    }

    const onKeyDownHandler = (key: String) => {
      if (key === 'Enter') {
        removeFromGroup();
      }
    };

    return (
      <div className="flex flex-col gap-4 p-11">
        <Input className="border-2 border-black rounded-md px-2 py-1" type="text" placeholder="Username" required min={1} max={15}
          onKeyDown={event => onKeyDownHandler(event.key)} onChange={event => setUsername(event.target.value)} autoFocus />
        <Button className="border-2 border-black rounded-md px-2 py-1" onClick={removeFromGroup}>Remove</Button>
      </div>
    )
  }

  const MembersModalContent = () => {

    const getGroupMembers = async () => {
      await axios.post('/getGroupMembers', {
        groupId: groupId
      }).then(res => {
        console.log(res);
        setGroupMembers(res.data);
      }).catch(err => {
        console.log(err);
      });
    }

    const renderList = () => {
      getGroupMembers;
      return groupMembers.map(function (displayName) {
        return (
          <ul>
            <li>{displayName}</li>
          </ul>
        )
      })
    }

    return (
      <div className="flex flex-col gap-4 p-11">
        {renderList()}
      </div>
    )
  }

  const deleteGroup = async () => {
    await axios.post('/deleteGroup', {
      groupid: groupId, token: localStorage.getItem('auth-token')
    }).then(res => {
      console.log(res); router.push("/groups");
    }).catch(err => {
      console.log(err);
    });
  }

  const MessageDeleteModalContent = () => {

    const setMsgDeleteTime = async () => {
      await axios.post('/setMsgDeleteTime', {
        groupid: groupId, token: localStorage.getItem('auth-token'), deleteTime: deleteTime
      }).then(res => {
        console.log(res);
        setIsMessageDeleteModalOpen(false);
      }).catch(err => {
        console.log(err);
      })
    }

    const onKeyDownHandler = (key: String) => {
      if (key === 'Enter') {
        setMsgDeleteTime();
      }
    };

    return (
      <div className="flex flex-col gap-4 p-11">
        <Input className="border-2 border-black rounded-md px-2 py-1" type="number" placeholder="Days Visible" min='0' required pattern="^[0-9]*$"
          onKeyDown={event => onKeyDownHandler(event.key)} onChange={event => setDeleteTime(Number(event.target.value))} autoFocus />
        <Button className="border-2 border-black rounded-md px-2 py-1" onClick={setMsgDeleteTime}>Enter</Button>
      </div>
    )
  }

  return (
    <div className="basis-[85%] p-5 overflow-y-scroll flex flex-cols-2 gap-2">
      <div className="flex flex-col w-1/4 border">
      <h1 className="font-bold text-xl underline">{groupName}</h1>
            <ul>
                <Modal
                  title="Send Invite"
                  children={<>{InviteModalContent()}</>}
                  triggerText="Add Member"
                  isOpen={isSendInviteModalOpen}
                  setIsOpen={setIsSendInviteModalOpen}
                />
                <Modal
                  title="Remove Member"
                  children={<>{RemoveModalContent()}</>}
                  triggerText="Remove Member"
                  isOpen={isRemoveMemberModalOpen}
                  setIsOpen={setIsRemoveMemberModalOpen}
                />
                <Modal
                  title="Members"
                  children={<>{MembersModalContent()}</>}
                  triggerText="List of Members"
                  isOpen={isDisplayMembersModalOpen}
                  setIsOpen={setIsDisplayMembersModalOpen}
                />
              <li className="pt-4 cursor-pointer" onClick={deleteGroup}>Delete Group</li>
              <Modal
                  title="Message Delete Time"
                  children={<>{MessageDeleteModalContent()}</>}
                  triggerText="Messages delete time"
                  isOpen={isMessageDeleteModalOpen}
                  setIsOpen={setIsMessageDeleteModalOpen}
                />
            </ul>
      </div>
      <div className="flex flex-col w-full overflow-y-scroll">
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
    </div>
  );
}

export default ChatBody;
