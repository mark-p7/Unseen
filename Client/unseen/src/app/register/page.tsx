"use client";
import React, { useContext, useEffect } from "react";
import axios from 'axios';
import { Context } from "@/context/userContext";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { useForm } from "react-hook-form";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "@/app/components/navbar";

const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
  passwordConfirm: z.string().min(2).max(50),
}).refine(({ password, passwordConfirm }) => password === passwordConfirm, { message: "Passwords do not match", path: ["passwordConfirm"] });

export default function Home() {
  const { userStatus, setUserStatus } = useContext(Context);
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      passwordConfirm: ""
    },
  })

  axios.defaults.baseURL = 'https://localhost:8080/api';

  useEffect(() => {
    // Authentication
    if (userStatus != undefined && userStatus?.loggedIn) {
      router.push('/');
    }
  }, [userStatus]);

  const register = async (username: string, password: string) => {
    console.log("Registering...");
    await axios.post('/register', {
      username: username,
      password: password
    }).then(function (response) {
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
    }).catch(function (error) {
      console.log(error);
    });
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    register(values.username, values.password);
  }

  return (
    <>
      <Navbar isLoggedIn={false} />
      <div className="h-[calc(100vh-67px)] w-screen flex justify-center items-center">
        <div className="flex mb-28">
          <div className="flex justify-center items-center bg-transparent w-60">
            <p className="text-white text-4xl">
              Register
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
                <FormField
                  control={form.control}
                  name="passwordConfirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input className="w-80" type="password" placeholder="Confirm Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-center">
                  <Button type="submit" className="h-9">Register &rarr;</Button>
                </div>
                <div className="flex justify-center">
                  <p className="text-sm">
                    Already have an account? <span className="font-bold cursor-pointer" onClick={() => router.push("/login")}>Login &rarr;</span>
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  )
}
