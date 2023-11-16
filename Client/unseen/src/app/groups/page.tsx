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
import { Modal } from "@/app/components/modal";
import { Input } from "@/app/components/ui/input";


export default function Home() {
    const { userStatus, setUserStatus } = useContext(Context);
    const router = useRouter()
    var groupModel = { groupName: 'loading...', groupMemberCount: 'loading...', _id: '' }
    const [groups, setGroups] = useState([groupModel])
    const [invites, setInvites] = useState([{ groupName: "", _id: "" }])
    const [isChangeDisplayNameModalOpen, setIsChangeDisplayNameModalOpen] = useState<boolean>(false);

    axios.defaults.baseURL = 'https://localhost:8080/api';

    useEffect(() => {
        // Authentication
        if (userStatus != undefined && !userStatus?.loggedIn) {
            router.push('/login');
        }
    }, [userStatus]);

    useEffect(() => {
        axios.post('/getGroups', {
            token: localStorage.getItem('auth-token')
        }).then(res => {
            const nextGroups = res.data;
            setGroups(nextGroups);
            console.log(nextGroups);
        });
    }, [])

    useEffect(() => {
        axios.post('/getInvites', {
            token: localStorage.getItem('auth-token')
        }).then(res => { const nextInvites = res.data; setInvites(nextInvites); console.log(nextInvites); });
    }, [])


    const navigateToCreateGroup = () => {
        router.push('/create-group');
    }

    const renderCards = () => {
        return groups.map(group => {
            if (group != null) {
                return (
                    <Link href={`/group/${group._id}`} key={group._id} className="rounded shadow-lg border border-gray-400 rounded-b p-10 pb-20 flex flex-col">
                        <div className="font-bold mb-2">{group.groupName}</div>
                        <p className="text-gray-300 text-base ">
                            members: {group.groupMemberCount}
                        </p>
                    </Link>
                )
            }
        })
    }

    const renderTable = () => {
        return invites.map(invite => {

            const joinGroup = async () => {
                await axios.post('/joinGroup', {
                    groupid: invite._id, token: localStorage.getItem('auth-token')
                }).then(res => {
                    console.log(res); router.push(`/groups/${invite._id}`);
                }).catch(err => {
                    console.log(err);
                });
            }

            const declineInvite = async () => {
                await axios.post('/declineInvite', {
                    groupid: invite._id, token: localStorage.getItem('auth-token')
                }).then(res => {
                    console.log(res); router.replace('/groups');
                }).catch(err => {
                    console.log(err);
                });
            }

            return (
                <TableRow>
                    <TableCell className="font-medium">{invite.groupName}</TableCell>
                    <TableCell className="font-medium"><Button onClick={() => joinGroup()}>Accept</Button></TableCell>
                    <TableCell className="font-medium"><Button onClick={() => declineInvite()}>Decline</Button></TableCell>
                </TableRow>
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
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Invites</TableHead>
                        <TableHead className="w-[100px]">Accept</TableHead>
                        <TableHead className="w-[100px]">Decline</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>{renderTable()}
                </TableBody>
            </Table>
        </div>
    )
}