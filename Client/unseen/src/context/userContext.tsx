"use client";
import React, { useState, createContext } from "react";
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export const Context = createContext<any>(null);

export const ContextProvider = ({ children }: any) => {

    const router = useRouter()
    const pathname = usePathname()

    const [userStatus, setUserStatus] = useState(typeof window !== 'undefined' ? {
        loggedIn: localStorage.getItem('auth-token') ? true : false,
        privateKey: localStorage.getItem('privateKey') ? localStorage.getItem('privateKey') : null,
        publicKey: localStorage.getItem('publicKey') ? localStorage.getItem('publicKey') : null,
    } : { loggedIn: false, privateKey: null, publicKey: null });

    // if (userStatus.loggedIn === false && pathname !== '/login' && pathname !== '/register') {
    //     router.push('/login');
    // }

    return (
        <Context.Provider value={{ userStatus, setUserStatus }}>
            {children}
        </Context.Provider>
    );
};