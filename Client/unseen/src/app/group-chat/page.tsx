"use client";
import { socket } from "@/socket";
import { useContext, useEffect, useState } from "react";
import { Context } from "@/context/userContext";
import { redirect } from "next/navigation";
import axios from "axios";
import { useRouter } from "next/navigation";
import "./styling.css";

import Messages from './Messages/Messages';

export default function GroupChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Send message to server
    socket.emit("message", message);
    setMessage("");
  };

  const { userStatus, setUserStatus } = useContext(Context);
  const router = useRouter();

  axios.defaults.baseURL = "https://localhost:8080/api";
  
  useEffect(() => {
    // Receive messages from server
    socket.on("message", (message) => {
      setMessages((messages) => [...messages, message]);
    });
  }, []);

  useEffect(() => {
    console.log(userStatus);
    // Authentication
    if (userStatus != undefined && !userStatus?.loggedIn) {
      return redirect("/login");
    }
  }, [userStatus]);

  return (
    <body>
        <div className="header">
          <h1>UNSEEN</h1>
        </div>
        <div className="sidebar">
          <h2>Group1</h2>
          <button>Add members</button>
          <button>Remove members</button>
          <button>List of members</button>
          <button>Delete group</button>
          <button>Auto host all*</button>
          <button>Set how long messages stay visible</button>
          <button>Hide group display name</button>
        </div>
        <div className="chatArea">
          <div className="messageArea">
            {messages.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="Message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </body>
    );
  }
