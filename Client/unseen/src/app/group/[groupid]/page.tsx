"use client";
import { useContext, useEffect, useState } from "react";
import axios from 'axios';
import { Context } from "@/context/userContext";
import { useRouter } from "next/navigation";
import { useParams } from 'next/navigation'
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
    const params = useParams()
    const [isChangeDisplayNameModalOpen, setIsChangeDisplayNameModalOpen] = useState<boolean>(false);
    const [username, setUsername] = useState("");

    axios.defaults.baseURL = 'https://localhost:8080/api';

    useEffect(() => {
        // Authentication
        if (userStatus != undefined && !userStatus?.loggedIn) {
            router.push('/login');
        }
    }, [userStatus]);

    var groupModel = { groupName: '', groupMemberCount: '', _id: '', groupMembers: [] }
    var userModel = { username: '', id: '' }

    const [group, setGroup] = useState(groupModel)
    const [members, setMembers] = useState([userModel])

    useEffect(() => {
        axios.post('/getGroup', {
            groupid: params.groupid
        }).then(res => {
            const nextGroup = res.data;
            setGroup(nextGroup);
            console.log(nextGroup);
            axios.post('/getGroupMembers', {
                memberids: nextGroup.groupMembers
            }).then(res => {
                const nextMembers = res.data;
                axios.post('getUserId', { token: localStorage.getItem('auth-token')
                }).then(res => {
                    const userid = res.data;
                    console.log("members ids: ", nextGroup.groupMembers);
                    console.log("user id: ", userid);
                    if (nextGroup.groupMembers.includes(userid)) {
                        setMembers(nextMembers);
                        console.log("members: ", nextMembers);
                    } else {
                        router.push('/groups');
                    }
                });
            });
        });
    }, [])



    const leaveGroup = async () => {
        await axios.post('/leaveGroup', {
            groupid: params.groupid, token: localStorage.getItem('auth-token')
        }).then(res => {
            console.log(res); router.push('/groups');
        }).catch(err => {
            console.log(err);
        })
    }

    const removeFromGroup = async (userid: String) => {
        await axios.post('/removeMember', {
            groupid: params.groupid, userid: userid
        }).then(res => {
            router.push(`/group/${group._id}`);
        }).catch(err => {
            console.log(err);
        })
    }

    const deleteGroup = async () => {
        await axios.post('/deleteGroup', {
            groupid: params.groupid
        }).then(res => {
            console.log(res); router.push("/groups");
        }).catch(err => {
            console.log(err);
        });
    }


    const renderTable = () => {
        return members.map(member => {
            return (
                <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.username}</TableCell>
                    <TableCell><Button onClick={() => removeFromGroup(member.id)}>Remove from group</Button></TableCell>
                    <TableCell><Button onClick={() => leaveGroup()}>Leave group</Button></TableCell>
                </TableRow>
            )
        })
    }

    const ModalContent = () => {
    
        const sendInvite = async() => {
            await axios.post('/sendInvite', {
                username: username, groupId: params.groupid, token: localStorage.getItem('auth-token')
            }).then(res => {
                console.log(res.data);
            }).catch(err => {
                console.log(err);
            });
        }
    
        return (
          <div className="flex flex-col gap-4 p-11">
            <Input className="border-2 border-black rounded-md px-2 py-1" type="text" placeholder="Username" onChange={event => setUsername(event.target.value)} />
            <Button className="border-2 border-black rounded-md px-2 py-1" onClick={sendInvite}>Send Invite</Button>
          </div>
        )
      }


    return (
        <div className="flex flex-col justify-between">
            <div>{group.groupName}</div>
            <div><Button onClick={deleteGroup}>Delete group</Button></div>
            <Modal
                title="Send Invite"
                children={<>{ModalContent()}</>}
                triggerText="Send Invite"
                isOpen={isChangeDisplayNameModalOpen}
                setIsOpen={setIsChangeDisplayNameModalOpen}
              />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Members</TableHead>
                        <TableHead className="w-[100px]">Remove member</TableHead>
                        <TableHead className="w-[100px]">Leave group</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>{renderTable()}
                </TableBody>
            </Table>
        </div>
    )
}