"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from 'axios';
import { useRouter } from "next/navigation";
import { Context } from "@/context/userContext";
import { Button } from "@/app/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/app/components/ui/form"
import { AlertCircle } from "lucide-react"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/app/components/ui/alert"
import { Input } from "@/app/components/ui/input"
import { useForm } from "react-hook-form";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "@/app/components/navbar";

const formSchema = z.object({
    username: z.string().min(2).max(50),
    password: z.string().min(2).max(50),
})

export default function Home() {
    const { userStatus, setUserStatus } = useContext(Context);
    const router = useRouter()
    const [isWrongPassword, setIsWrongPassword] = useState<boolean>(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    axios.defaults.baseURL = 'http://localhost:8080/api';

    useEffect(() => {
        // Authentication
        if (userStatus != undefined && userStatus?.loggedIn) {
            router.push('/');
        }
    }, [userStatus]);

    const login = async (username: string, password: string) => {
        console.log("Logging in...")
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
                    displayName: response.data.displayName,
                    loggedIn: true,
                    privateKey: localStorage.getItem('privateKey') || null,
                    publicKey: localStorage.getItem('publicKey') || null,
                    authToken: authToken
                })
                router.push('/');
            })
            .catch(function (error) {
                if (error.response.status == 403 && error.response?.data?.errMsg == "Incorrect Username or Password") {
                    setIsWrongPassword(true);
                }
                console.log(error);
            });
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        login(values.username, values.password);
    }

    return (
        <>
            <Navbar isLoggedIn={false} />
            <div className="h-[calc(100vh-67px)] w-screen flex justify-center items-center">
                <div className="flex mb-28">
                    <div className="flex justify-center items-center bg-transparent w-60">
                        <p className="text-white text-4xl">
                            Login
                        </p>
                    </div>
                    <div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-28">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input className="w-80" placeholder="Username" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input className="w-80" type="password" placeholder="Password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-center">
                                    <Button type="submit" className="h-9">Login &rarr;</Button>
                                </div>
                                <div className="flex justify-center">
                                    <p className="text-sm">
                                        No Account? <span className="font-bold cursor-pointer" onClick={() => router.push("/register")}>Register &rarr;</span>
                                    </p>
                                </div>
                                {isWrongPassword &&
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>
                                            Wrong Username or Password
                                        </AlertDescription>
                                    </Alert>
                                }
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    )
}
