"use client";
import React, { useContext, useEffect, useState } from "react";
import { Context } from "@/context/userContext";
import { redirect } from 'next/navigation';
import axios from "axios";
import { useRouter } from "next/navigation";
import { Navbar } from "@/app/components/navbar";
import { Modal } from "@/app/components/modal";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

export default function Home() {
  const { userStatus, setUserStatus } = useContext(Context);
  const router = useRouter();
  const [groupsJoined, setGroupsJoined] = useState<number>(0);
  const [displayName, setDisplayName] = useState("");
  const [accountDeletionDate, setAccountDeletionDate] = useState("");
  const [isChangeDisplayNameModalOpen, setIsChangeDisplayNameModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (userStatus != undefined && !userStatus?.loggedIn) {
      return redirect('/login');
    }
    if (userStatus?.authToken != null || userStatus?.authToken != undefined) {
      getAccountInfo();
    }
  }, [userStatus]);

  useEffect(() => {
    console.log("Display Name: " + displayName);
  }, [displayName]);

  const getAccountInfo = async () => {
    await axios.post('/account/get', { token: userStatus?.authToken }).then(res => {
      setDisplayName(res.data.displayName);
      setGroupsJoined(res.data.groupsJoined);
      setAccountDeletionDate(res.data.accountDeletionDate);
    }).catch(err => {
      console.log(err);
    })
  }

  const logout = async () => {
    await axios.post('/logout', { token: userStatus?.authToken }).then(() => {
      setUserStatus((prevState: any) => ({ ...prevState, loggedIn: false, username: null, authToken: null }));
      localStorage.removeItem('username');
      localStorage.removeItem('auth-token');
      router.push('/login');
    }).catch(err => {
      console.log(err);
    })
  }

  const handleLogout = () => {
    console.log("logging out")
    logout();
  }

  const deleteAccount = async () => {
    await axios.post('/account/delete', { token: userStatus?.authToken }).then(res => {
      if (res.data.message != "Account Deleted") {
        console.log("Error deleting account");
        return;
      }
      setUserStatus((prevState: any) => ({ ...prevState, loggedIn: false, username: null, authToken: null }));
      localStorage.removeItem('username');
      localStorage.removeItem('auth-token');
      router.push('/login');
    }).catch(err => {
      console.log(err);
    })
  }

  const handleDelete = () => {
    console.log("Deleting account")
    deleteAccount();
  }

  const ModalContent = () => {

    const [tempDisplayName, setTempDisplayName] = useState<string>("");

    const changeDisplayName = async () => {
      await axios.put('/account/update/displayname', { token: userStatus?.authToken, displayName: tempDisplayName }).then(res => {
        if (res.data.message != tempDisplayName) {
          console.log("Error changing display name");
          return;
        }
        setDisplayName(tempDisplayName);
        setIsChangeDisplayNameModalOpen(false);
      }).catch(err => {
        console.log(err);
      })
    };

    return (
      <div className="flex flex-col gap-4 p-11">
        <Input className="border-2 border-black rounded-md px-2 py-1" type="text" placeholder="New Display Name" defaultValue={displayName} onChange={event => setTempDisplayName(event.target.value)} />
        <Button className="border-2 border-black rounded-md px-2 py-1" onClick={changeDisplayName}>Change</Button>
      </div>
    )
  }

  return (
    <>
      <Navbar isLoggedIn={userStatus?.loggedIn} />
      <div className="h-[calc(100vh-67px)] w-full">
        <div className="h-full w-full py-10 px-48">
          <h1 className="text-3xl font-bold">Account</h1>
          <div className="flex justify-center h-4/5 gap-6 pt-10">
            <div className="w-8/12 p-7 border-2 border-white">
              <span className="w-full text-center">
                <h1 className="text-xl font-bold">Settings</h1>
              </span>
              <Modal
                title="Change Display Name"
                // children={<>{ModalContent()}</>}
                triggerText="Change Display Name"
                isOpen={isChangeDisplayNameModalOpen}
                setIsOpen={setIsChangeDisplayNameModalOpen}
              >
                <ModalContent></ModalContent>
              </Modal>
              <h1 className="mt-4 cursor-pointer">Set Auto Account Deletion</h1>
              <h1 className="mt-4 cursor-pointer" onClick={handleLogout}>Logout</h1>
              <h1 className="mt-4 cursor-pointer" onClick={handleDelete}>Delete Account</h1>
            </div>
            <div className="w-4/12 p-7 border-2 border-white">
              <span className="w-full text-center">
                <h1 className="text-xl font-bold">Account Info</h1>
              </span>
              <h1 className="mt-4">Username: {userStatus?.username}</h1>
              <h1 className="mt-4">Display Name: {displayName}</h1>
              <h1 className="mt-4">Groups Joined: {groupsJoined}</h1>
              <h1 className="mt-4">Account Deletion Date: {accountDeletionDate}</h1>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
