"use client";
import React, { useState, createContext, useEffect } from "react";
import axios from 'axios';

interface UserStatus {
    username: string | null;
    loggedIn: boolean | null;
    privateKey: string | null;
    publicKey: string | null;
    authToken: string | null;
}
export const Context = createContext<any>(null);

export const ContextProvider = ({ children }: any) => {
    axios.defaults.baseURL = 'https://localhost:8080/api';

    const [userStatus, setUserStatus] = useState<UserStatus | undefined>();

    useEffect(() => {
        async function validateAuthToken() {
            if (typeof window === 'undefined') {
                return;
            }
            await axios.post('/validateToken', {
                token: localStorage.getItem('auth-token')
            })
                .then(function (response) {
                    console.log(response);
                    setUserStatus({
                        username: response.data.username,
                        loggedIn: response.data.token.length > 0 ? true : false,
                        privateKey: localStorage.getItem('privateKey') ? localStorage.getItem('privateKey') : null,
                        publicKey: localStorage.getItem('publicKey') ? localStorage.getItem('publicKey') : null,
                        authToken: localStorage.getItem('auth-token') ? localStorage.getItem('auth-token') : null
                    });
                })
                .catch(function (error) {
                    setUserStatus({
                        username: null,
                        loggedIn: false,
                        privateKey: localStorage.getItem('privateKey') ? localStorage.getItem('privateKey') : null,
                        publicKey: localStorage.getItem('publicKey') ? localStorage.getItem('publicKey') : null,
                        authToken: null
                    });
                    console.log(error);
                });
        }
        validateAuthToken();
    }, []);

    return (
        <Context.Provider value={{ userStatus, setUserStatus }}>
            {children}
        </Context.Provider>
    );
};