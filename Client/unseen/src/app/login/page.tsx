"use client";
import { socket } from "@/socket";
import { useEffect, useState } from "react";
import axios from 'axios';

export default function Home() {

    axios.defaults.baseURL = 'https://localhost:8080/api';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const login = async () => {
        if (password !== confirmPassword) {
            console.log("passwords do not match");
            return undefined;
        }

        await axios.post('/login', {
            username: username,
            password: password
        })
            .then(function (response) {
                console.log(response);
                localStorage.setItem('auth-token', response.data.token);
            })
            .catch(function (error) {
                console.log(error);
            });

        setIsLoading(false);
    }

    const handleLogin = () => {
        console.log("logging in");
        setIsLoading(true);
        login();

    }

    return (
        <>
            <h1>Login page</h1>
            <input type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
            <input type="password" placeholder="confirm password" onChange={(e) => setConfirmPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </>
    )
}
