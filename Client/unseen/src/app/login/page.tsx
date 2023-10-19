"use client";
import { socket } from "@/socket";
import { useContext, useEffect, useState } from "react";
import axios from 'axios';
import { redirect, useRouter } from "next/navigation";
import { Context } from "@/context/userContext";

export default function Home() {
    const { userStatus, setUserStatus } = useContext(Context);
    const router = useRouter()

    axios.defaults.baseURL = 'https://localhost:8080/api';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Authentication
        if (userStatus != undefined && userStatus?.loggedIn) {
            router.push('/');
        }
    }, [userStatus]);

    const login = async () => {
        await axios.post('/login', {
            username: username,
            password: password
        })
            .then(function (response) {
                const authToken = response.data.token[response.data.token.length - 1];
                localStorage.setItem('auth-token', authToken);
                localStorage.setItem('username', username);
                setUserStatus({
                    username: username,
                    loggedIn: true,
                    privateKey: localStorage.getItem('privateKey') || null,
                    publicKey: localStorage.getItem('publicKey') || null,
                    authToken: authToken
                })
                router.push('/');
            })
            .catch(function (error) {
                console.log(error);
            });

        setIsLoading(false);
    }

    const handleLogin = () => {
        console.log("logging in");
        login();
    }

    return (
        <>
            <h1>Login page</h1>
            <input type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </>
    )
}
