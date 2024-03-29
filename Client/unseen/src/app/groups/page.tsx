"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from 'axios';
import { Context } from "@/context/userContext";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Button } from "@/app/components/ui/button";
import { Modal } from "@/app/components/modal";
import { Input } from "@/app/components/ui/input";
import { Navbar } from "@/app/components/navbar";

export default function Home() {
    const { userStatus } = useContext(Context);
    const router = useRouter()
    const groupModel = { groupName: 'loading...', groupMemberCount: 'loading...', _id: '' }
    const [groups, setGroups] = useState([groupModel])
    // const [invites, setInvites] = useState([{ groupName: "", _id: "" }])
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState<boolean>(false);
    // const [groupName, setGroupName] = useState("");

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

    // useEffect(() => {
    //     axios.post('/getInvites', {
    //         token: localStorage.getItem('auth-token')
    //     }).then(res => { const nextInvites = res.data; setInvites(nextInvites); console.log(nextInvites); });
    // }, [])

    const renderCards = () => {
        return groups.map(group => {
            if (group != null) {
                return (
                    <Link href={`/group-chat/${group._id}`} key={group._id} className="rounded overflow-hidden shadow-lg border-2 border-white rounded-b p-10 pb-20 flex flex-col">
                        <div className="font-bold mb-2">{group.groupName}</div>
                        <p className="text-gray-300 text-base ">
                            members: {group.groupMemberCount}
                        </p>
                    </Link>
                )
            }
        })
    }

    // const renderTable = () => {
    //     return invites.map(invite => {
    //
    //         const joinGroup = async () => {
    //             await axios.post('/joinGroup', {
    //                 groupid: invite._id, token: localStorage.getItem('auth-token')
    //             }).then(res => {
    //                 console.log(res); router.push(`/groups/${invite._id}`);
    //             }).catch(err => {
    //                 console.log(err);
    //             });
    //         }
    //
    //         const declineInvite = async () => {
    //             await axios.post('/declineInvite', {
    //                 groupid: invite._id, token: localStorage.getItem('auth-token')
    //             }).then(res => {
    //                 console.log(res); router.replace('/groups');
    //             }).catch(err => {
    //                 console.log(err);
    //             });
    //         }
    //
    //         return (
    //             <TableRow key={invite.groupName}>
    //                 <TableCell className="font-medium">{invite.groupName}</TableCell>
    //                 <TableCell className="font-medium"><Button onClick={() => joinGroup()}>Accept</Button></TableCell>
    //                 <TableCell className="font-medium"><Button onClick={() => declineInvite()}>Decline</Button></TableCell>
    //             </TableRow>
    //         )
    //     })
    // }

    //         const joinGroup = async () => {
    //             await axios.post('/joinGroup', {
    //                 groupid: invite._id, token: localStorage.getItem('auth-token')
    //             }).then(res => {
    //                 console.log(res); router.push(`/groups/${invite._id}`);
    //             }).catch(err => {
    //                 console.log(err);
    //             });
    //         }

    //         const declineInvite = async () => {
    //             await axios.post('/declineInvite', {
    //                 groupid: invite._id, token: localStorage.getItem('auth-token')
    //             }).then(res => {
    //                 console.log(res); router.replace('/groups');
    //             }).catch(err => {
    //                 console.log(err);
    //             });
    //         }

    //         return (
    //             <TableRow key={invite.groupName}>
    //                 <TableCell className="font-medium">{invite.groupName}</TableCell>
    //                 <TableCell className="font-medium"><Button onClick={() => joinGroup()}>Accept</Button></TableCell>
    //                 <TableCell className="font-medium"><Button onClick={() => declineInvite()}>Decline</Button></TableCell>
    //             </TableRow>
    //         )
    //     })
    // }
    // const createGroupHandler =async () => {
    //     if (!groupName.toString().trim().length) {
    //         return 'require';
    //       }
    // }

    const ModalContent = () => {

        const [groupToCreate, setGroupToCreate] = useState("");

        const createGroup = async () => {
            await axios.post('/createGroup', {
                groupName: groupToCreate, token: localStorage.getItem('auth-token')
            }).then(res => {
                console.log(res.data);
                setIsCreateGroupModalOpen(false);
                setGroups((groups) => [ ...groups, res.data]);
                console.log("groups: ", groups)
            }).catch(err => {
                console.log(err);
            });
        }

        const onKeyDownHandler = (key: string) => {
            if (key === 'Enter') {
                createGroup();
            }
        };

        return (
            <div className="flex flex-col gap-4 p-11">
                <Input className="border-2 border-black rounded-md px-2 py-1" type="text" placeholder="Group Name" 
                    onKeyDown={event => onKeyDownHandler(event.key)} value={groupToCreate} onChange={event => setGroupToCreate(event.target.value)} autoFocus />
                <Button className="border-2 border-black rounded-md px-2 py-1" onClick={() => createGroup()}>Create Group</Button>
            </div>
        )
    }


    return (
        // <div className="flex flex-col justify-between">
        //     <div className="grid grid-cols-2 w-full">
        //         <p className="text-white text-4xl w-1/2 justify-self-center">
        //             Groups
        //         </p>
        //         <Modal
        //             title="Create Group"
        //             children={<>{ModalContent()}</>}
        //             triggerText="Create Group"
        //             isOpen={isCreateGroupModalOpen}
        //             setIsOpen={setIsCreateGroupModalOpen}
        //         />
        //     </div>
        //     <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 justify-center content-center m-20">{renderCards()}</div>
        //     <Table>
        //         <TableHeader>
        //             <TableRow>
        //                 <TableHead className="w-[100px]">Invites</TableHead>
        //                 <TableHead className="w-[100px]">Accept</TableHead>
        //                 <TableHead className="w-[100px]">Decline</TableHead>
        //             </TableRow>
        //         </TableHeader>
        //         <TableBody>{renderTable()}
        //         </TableBody>
        //     </Table>
        // </div>

        <>
            <Navbar isLoggedIn={userStatus?.loggedIn} />
            <div className="h-[calc(100vh-67px)] w-full">
                <div className="h-full w-full py-10 px-48">
                    <div className="w-1/3 float-left"><h1 className="text-3xl font-bold">Groups</h1></div>
                    <div className="w-2/3 text-right md:float-right">
                        <Modal
                            title="Create Group"
                            // children={<>{ModalContent()}</>}
                            triggerText="Create Group"
                            isOpen={isCreateGroupModalOpen}
                            setIsOpen={setIsCreateGroupModalOpen}
                        >
                            <ModalContent></ModalContent>
                        </Modal>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 justify-center content-center m-20">{renderCards()}</div>
                </div>
            </div>
        </>
    )
}