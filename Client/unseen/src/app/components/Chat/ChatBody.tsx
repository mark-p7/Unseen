"use client";
import { useSocket } from "@/context/socketContext";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Context } from "@/context/userContext";
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
  const [messageHistory, setMessageHistory] = useState([]);
  const { userStatus } = useContext(Context);
  const [isSendInviteModalOpen, setIsSendInviteModalOpen] = useState<boolean>(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState<boolean>(false);
  const [isDisplayMembersModalOpen, setIsDisplayMembersModalOpen] = useState<boolean>(false);
  const [isMessageDeleteModalOpen, setIsMessageDeleteModalOpen] = useState<boolean>(false);
  const [groupMembers, setGroupMembers] = useState([""]);
  const [groupName, setGroupName] = useState("Group Name");
  const [deleteTime, setDeleteTime] = useState<number>(0);
  const [tempDeleteTime, setTempDeleteTime] = useState<number>(0);
  const [isGroupOwner, setIsGroupOwner] = useState<boolean>(false);


  useEffect(() => {
    axios.post('/message/getAllFromGroup', {
      groupId: groupId,
    }).then(res => {
      console.log("get all data: ", res.data);
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

  useEffect(() => {
    axios.post('/isGroupOwner', {
      groupid: groupId, token: localStorage.getItem('auth-token')
    }).then(res => {
      console.log(res.data);
      setIsGroupOwner(res.data);
    });
  }, [])

  useEffect(() => {
    axios.post('/getGroup', {
      groupid: groupId
    }).then(res => {
      console.log(res.data);
      setDeleteTime(res.data.messageDeleteTime);
      setGroupName(res.data.groupName);
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

    const [memberToInvite, setMemberToInvite] = useState("");

    const sendInvite = async () => {
      await axios.post('/sendInvite', {
        username: memberToInvite, groupId: groupId, token: localStorage.getItem('auth-token')
      }).then(res => {
        console.log(res.data);
        setIsSendInviteModalOpen(false);
      }).catch(err => {
        console.log(err);
      });
    }

    const onKeyDownHandler = (key: string) => {
      if (key === 'Enter') {
        sendInvite();
      }
    };

    return (
      <div className="flex flex-col gap-4 p-11">
        <Input className="border-2 border-black rounded-md px-2 py-1" type="text" placeholder="Username" required min={1} max={15}
          onKeyDown={event => onKeyDownHandler(event.key)} value={memberToInvite} onChange={event => setMemberToInvite(event.target.value)} autoFocus />
        <Button className="border-2 border-black rounded-md px-2 py-1" onClick={sendInvite}>Send Invite</Button>
      </div>
    )
  }

  const RemoveModalContent = () => {

    const [memberToRemove, setMemberToRemove] = useState("");

    const removeFromGroup = async () => {
      await axios.post('/removeMember', {
        groupid: groupId, username: memberToRemove, token: localStorage.getItem('auth-token')
      }).then(res => {
        console.log(res);
        setIsRemoveMemberModalOpen(false);
      }).catch(err => {
        console.log(err);
      })
    }

    const onKeyDownHandler = (key: string) => {
      if (key === 'Enter') {
        removeFromGroup();
      }
    };

    return (
      <div className="flex flex-col gap-4 p-11">
        <Input className="border-2 border-black rounded-md px-2 py-1" type="text" placeholder="Username" required min={1} max={15}
          onKeyDown={event => onKeyDownHandler(event.key)} value={memberToRemove} onChange={event => setMemberToRemove(event.target.value)} autoFocus />
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
        setGroupMembers((groupMembers) => [...groupMembers, res.data]);
      }).catch(err => {
        console.log(err);
      });
    }

    const renderList = () => {
      getGroupMembers;
      return groupMembers.map(function (displayName) {
        return (
          <ul key={displayName}>
            <li >{displayName}</li>
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
        groupid: groupId, token: localStorage.getItem('auth-token'), deleteTime: tempDeleteTime
      }).then(res => {
        console.log(res);
        setDeleteTime(tempDeleteTime)
        setIsMessageDeleteModalOpen(false);
      }).catch(err => {
        console.log(err);
      })
    }

    const onKeyDownHandler = (key: string) => {
      if (key === 'Enter') {
        setMsgDeleteTime();
      }
    };

    return (
      <div className="flex flex-col gap-4 p-11">
        <Input className="border-2 border-black rounded-md px-2 py-1" type="number" placeholder="Days Visible" min='0' required pattern="^[0-9]*$"
          onKeyDown={event => onKeyDownHandler(event.key)} value ={tempDeleteTime} onChange={event => setTempDeleteTime(Number(event.target.value))} autoFocus />
        <Button className="border-2 border-black rounded-md px-2 py-1" onClick={setMsgDeleteTime}>Enter</Button>
      </div>
    )
  }

  const renderGroupTabList = () => {
    if (isGroupOwner) {
      return (
        <ul className="px-2">
          <li><Modal
            title="Send Invite"
            // children={<>{InviteModalContent()}</>}
            triggerText="Add Member"
            isOpen={isSendInviteModalOpen}
            setIsOpen={setIsSendInviteModalOpen}
          >
            <InviteModalContent></InviteModalContent>
          </Modal>
        </li>
          <li><Modal
            title="Remove Member"
            // children={<>{RemoveModalContent()}</>}
            triggerText="Remove Member"
            isOpen={isRemoveMemberModalOpen}
            setIsOpen={setIsRemoveMemberModalOpen}
            >
            <RemoveModalContent></RemoveModalContent>
          </Modal></li>
          <li><Modal
            title="Members"
            // children={<>{MembersModalContent()}</>}
            triggerText="List of Members"
            isOpen={isDisplayMembersModalOpen}
            setIsOpen={setIsDisplayMembersModalOpen}
            >
            <MembersModalContent></MembersModalContent>
          </Modal></li>
          <li className="pt-4 cursor-pointer sm:text-left text-center" onClick={deleteGroup}>Delete Group</li>
          <li><Modal
            title="Message Delete Time"
            //children={<>{MessageDeleteModalContent()}</>}
            triggerText='Message delete time'
            isOpen={isMessageDeleteModalOpen}
            setIsOpen={setIsMessageDeleteModalOpen}
            >
              <MessageDeleteModalContent></MessageDeleteModalContent>
            </Modal></li>
          <li className="pt-4 sm:text-left text-center">Messages deleted after {deleteTime} days</li>
        </ul>
      )
    }else {
      return (
          <ul className="px-2">
          <li><Modal
            title="Members"
            //children={<>{MembersModalContent()}</>}
            triggerText="List of Members"
            isOpen={isDisplayMembersModalOpen}
            setIsOpen={setIsDisplayMembersModalOpen}
            >
              <MembersModalContent></MembersModalContent>
            </Modal></li>
          <li className="pt-4 sm:text-left text-center">Messages deleted after {deleteTime} days</li>
        </ul>
      )
    }
  }

  return (
    <div className="basis-[85%] p-5 overflow-y-scroll flex flex-cols-2 gap-2">
      <div className="flex flex-col w-1/3 border">
        <h1 className="font-bold text-xl underline overflow-x-hidden sm:text-left self-center my-2">{groupName}</h1>
        <div>{renderGroupTabList()}</div>
      </div>
      <div className="flex flex-col w-full overflow-y-scroll">

        {messageHistory?.map((message: any, index: number) =>
          message.socketId === "abcd" ? (
            <div className="flex self-center" key={index}>
              <div className="flex justify-center items-center">
                <p>{message.text}</p>
              </div>
            </div>
          ) : message.user === userStatus.userId ? (
            <div className="flex self-end flex-col items-end" key={index}>
              {message.content && <div className="flex justify-center bg-blue-500 rounded-full items-center px-3 py-1 text-white rounded-full rounded-br-none bg-primary">
                <p className="font-sans">{message.content}</p>
              </div>}
              <p className="py-2 pl-2 text-xs font-light">
                {new Date(message.datePosted).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ) : (
            <div className="flex gap-2 self-start" key={index}>
              <div className="self-center">
              </div>
              <div>
                <p className="pl-2 text-sm align-bottom">{message.displayName}</p>
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

        {messages[groupId]?.map((message: any, index: number) =>
          message.socketId === "abcd" ? (
            <div className="flex self-center" key={index}>
              <div className="flex justify-center items-center">
                <p>{message.text}</p>
              </div>
            </div>
          ) : message.socketId === socket?.id ? (
            <div className="flex self-end flex-col items-end" key={index}>
              {message.text && <div className="flex justify-center bg-blue-500 rounded-full items-center px-3 py-1 text-white rounded-full rounded-br-none bg-primary">
                <p className="font-sans">{message.text}</p>
              </div>}
              <p className="py-2 pl-2 text-xs font-light">
                {new Date(message.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
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
