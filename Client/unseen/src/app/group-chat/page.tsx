"use client";
import { socket } from "@/socket";
import { useContext, useEffect, useState } from "react";
import { Context } from "@/context/userContext";
import { redirect } from "next/navigation";
import axios from "axios";
import { useRouter } from "next/navigation";
import "./styling.css";

export default function GroupChat() {
  const { userStatus, setUserStatus } = useContext(Context);
  const router = useRouter();

  axios.defaults.baseURL = "https://localhost:8080/api";

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
        <div className="notification">User5 just joined</div>
        <div className="message">
          We just got the interview confirmed with our first client. - User1
        </div>
        <div className="warning">
          Remember, leave all devices at home. We can't be caught doing this or
          we risk putting their lives in danger, as well as our own! - Anon
        </div>
        <div className="notification">User5 just joined</div>
        <div className="message">
          We just got the interview confirmed with our first client. - User1
        </div>
        <div className="warning">
          Remember, leave all devices at home. We can't be caught doing this or
          we risk putting their lives in danger, as well as our own! - Anon
        </div>
        <div className="notification">User5 just joined</div>
        <div className="message">
          We just got the interview confirmed with our first client. - User1
        </div>
        <div className="warning">
          Remember, leave all devices at home. We can't be caught doing this or
          we risk putting their lives in danger, as well as our own! - Anon
        </div>
        <div className="notification">User5 just joined</div>
        <div className="message">
          We just got the interview confirmed with our first client. - User1
        </div>
        <div className="warning">
          Remember, leave all devices at home. We can't be caught doing this or
          we risk putting their lives in danger, as well as our own! - Anon
        </div>
        <div className="notification">User5 just joined</div>
        <div className="message">
          We just got the interview confirmed with our first client. - User1
        </div>
        <div className="warning">
          Remember, leave all devices at home. We can't be caught doing this or
          we risk putting their lives in danger, as well as our own! - Anon
        </div>
        <div className="notification">User5 just joined</div>
        <div className="message">
          We just got the interview confirmed with our first client. - User1
        </div>
        <div className="warning">
          Remember, leave all devices at home. We can't be caught doing this or
          we risk putting their lives in danger, as well as our own! - Anon
        </div>
        <div className="notification">User5 just joined</div>
        <div className="message">
          We just got the interview confirmed with our first client. - User1
        </div>
        <div className="warning">
          Remember, leave all devices at home. We can't be caught doing this or
          we risk putting their lives in danger, as well as our own! - Anon
        </div>
        <div className="notification">User5 just joined</div>
        <div className="message">
          We just got the interview confirmed with our first client. - User1
        </div>
        <div className="warning">
          Remember, leave all devices at home. We can't be caught doing this or
          we risk putting their lives in danger, as well as our own! - Anon
        </div>
        <div className="notification">User5 just joined</div>
        <div className="message">
          We just got the interview confirmed with our first client. - User1
        </div>
        <div className="warning">
          Remember, leave all devices at home. We can't be caught doing this or
          we risk putting their lives in danger, as well as our own! - Anon
        </div>
      </div>
      <input type="text" placeholder="Message" />
    </body>
  );
}
