"use client";
import { socket } from "@/socket";
import { useContext, useEffect, useState } from "react";
import axios from 'axios';
import { Context } from "@/context/userContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { userStatus, setUserStatus } = useContext(Context);
  const router = useRouter()

  axios.defaults.baseURL = 'https://localhost:8080/api';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Authentication
    if (userStatus != undefined && userStatus?.loggedIn) {
      router.push('/');
    }
  }, [userStatus]);

  const register = async () => {
    if (password !== confirmPassword) {
      console.log("passwords do not match");
      return undefined;
    }

    await axios.post('/register', {
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
      })
      .catch(function (error) {
        console.log(error);
      });

    setIsLoading(false);
  }

  const handleRegister = () => {
    console.log("Registering");
    register();
  }

  return (
    <>
      <h1>Register page</h1>
      <input type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
      <input type="password" placeholder="confirm password" onChange={(e) => setConfirmPassword(e.target.value)} />
      <button onClick={handleRegister}>Login</button>
    </>
  )
}
