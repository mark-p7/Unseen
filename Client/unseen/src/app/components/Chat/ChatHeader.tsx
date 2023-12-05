"use client";
import { useGroup } from "@/context/groupContext";
import React, { useState, useEffect } from "react";

function Popup({text, showPopup, setShowPopup,}: { text: string; showPopup: boolean; setShowPopup: React.Dispatch<boolean>; })
{
    useEffect(() => {
        if (showPopup) setTimeout(() => setShowPopup(false), 3000);
    }, [showPopup]);
    return (
        <div
            className={`absolute bottom-20 left-1/2 z-30 -translate-x-1/2 opacity-0 ${
                showPopup && "animate-popup"
            }`}
        >
            {text}
        </div>
    );
}

function ChatHeader({ groupId }: { groupId: string }) {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { groups, myGroups } = useGroup();
  //const group = groups.concat(myGroups).find((group) => group.id === groupId);
  const concatenatedGroups = Array.isArray(groups) && Array.isArray(myGroups)
    ? groups.concat(myGroups)
    : [];

  const group = concatenatedGroups.find((group) => group.id === groupId);
  return (
    <div className="basis-[7%] border-b-2 flex items-center justify-between p-3 font-medium">
      <p className="text-xl">{group?.title}</p>
      <button
        type="submit"
        className="btn"
        onClick={() => {
          navigator.clipboard.writeText(groupId);
          setIsCopied(true);
        }}
      >
        Copy Group ID
      </button>
      <Popup
        text="Group ID copied!"
        showPopup={isCopied}
        setShowPopup={setIsCopied}
      />
    </div>
  );
}

export default ChatHeader;
