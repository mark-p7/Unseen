"use client";
import { useContext, useEffect, useState } from "react";
import axios from 'axios';
import { Context } from "@/context/userContext";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Button } from "@/app/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table"


export default function Home() {
    const { userStatus, setUserStatus } = useContext(Context);
    const router = useRouter()

    axios.defaults.baseURL = 'https://localhost:8080/api';

    useEffect(() => {
        // Authentication
        if (userStatus != undefined && !userStatus?.loggedIn) {
            router.push('/login');
        }
    }, [userStatus]);

    var groupModel = { groupName: '', groupMemberCount: '', _id: '' }

    const [groups, setGroups] = useState([groupModel])

    useEffect(() => {
        axios.post('/getGroups', {
            token: localStorage.getItem('auth-token')
        }).then(res => { const nextGroups = res.data; setGroups(nextGroups); console.log(nextGroups); });
    }, [])


    const navigateToCreateGroup = () => {
        router.push('/create-group');
    }

    const renderCards = () => {
        return groups.map(group => {
            return (
                <Link href={`/group/${group._id}`} key = {group._id} className="rounded shadow-lg border border-gray-400 rounded-b p-10 pb-20 flex flex-col">
                        <div className="font-bold mb-2">{group.groupName}</div>
                        <p className="text-gray-300 text-base ">
                            members: {group.groupMemberCount}
                        </p>
                </Link>
            )
        })
    }


    return (
        <div className="flex flex-col justify-between">
            <div className="grid grid-cols-2 w-full">
                <p className="text-white text-4xl w-1/2 justify-self-center">
                    Groups
                </p>
                <div className="w-1/2 justify-self-end">
                    <Button onClick={navigateToCreateGroup} className="h-9 self-end">Create Group</Button>
                </div>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 justify-center content-center m-20">{renderCards()}</div>
        </div>
    )
}