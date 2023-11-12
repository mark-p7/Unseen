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


export default function Home() {
    const { userStatus, setUserStatus } = useContext(Context);
    const router = useRouter()
    const params = useParams()

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
            groupid: params
        }).then(res => { 
            const nextGroup = res.data; 
            setGroup(nextGroup); 
            console.log(nextGroup); 
            axios.post('/getGroupMembers', {
                memberids: nextGroup.groupMembers
            }).then(res => { const nextMembers = res.data; setMembers(nextMembers); console.log("members: ", nextMembers); });
        });
    }, [])



    const removeMember = async () => {
        await axios.post('/removeMember', { token: userStatus?.authToken }).then(res => {
            setUserStatus((prevState: any) => ({ ...prevState, loggedIn: false, username: null, authToken: null }));
            localStorage.removeItem('username');
            localStorage.removeItem('auth-token');
            router.push('/login');
        }).catch(err => {
            console.log(err);
        })
    }

    const deleteGroup = async () => {
        await axios.post('/deleteGroup', {
            groupid: params
        }).then(function(){router.push("/groups");
        });
    }

    const renderTable = () => {
        return members.map(member => {
            return (
                <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.username}</TableCell>
                    <TableCell><Button>Remove from group</Button></TableCell>
                </TableRow>
            )
        })
    }



    return (
        <div className="flex flex-col justify-between">
            <div>{group.groupName}</div>
            <div><Button onClick={deleteGroup}>Delete group</Button></div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Members</TableHead>
                        <TableHead className="w-[100px]">Remove member</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>{renderTable()}
                </TableBody>
            </Table>
        </div>
    )
}