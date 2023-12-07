"use client";
import React, { useContext, useEffect } from "react";
import { Context } from "@/context/userContext";
import { redirect } from 'next/navigation';
import { Navbar } from "@/app/components/navbar";

export default function Home() {
  const { userStatus } = useContext(Context);

  useEffect(() => {
    console.log(userStatus);
    // Authentication
    if (userStatus != undefined && !userStatus?.loggedIn) {
      return redirect('/login');
    }
    redirect("groups")
  }, [userStatus]);

  return (
    <>
      <Navbar isLoggedIn={userStatus?.loggedIn} />
      <div className="h-[calc(100vh-67px)] w-full">
        <div className="h-full w-full py-10 px-48">
          <h1 className="text-3xl font-bold">Directory</h1>
        </div>
      </div>
    </>
  )
}
