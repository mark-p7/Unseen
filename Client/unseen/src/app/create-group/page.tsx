"use client";
import { useContext, useEffect } from "react";
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

const formSchema = z.object({
  groupName: z.string().min(2).max(50),
  groupPassword: z.string().min(2).max(50),
  passwordConfirm: z.string().min(2).max(50),
}).refine(({ groupPassword, passwordConfirm }) => groupPassword === passwordConfirm, { message: "Passwords do not match", path: ["passwordConfirm"] });

export default function Home() {
  const { userStatus, setUserStatus } = useContext(Context);
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupName: "",
      groupPassword: "",
      passwordConfirm: ""
    },
  })

  axios.defaults.baseURL = 'https://localhost:8080/api';

  useEffect(() => {
    // Authentication
    if (userStatus != undefined && !userStatus?.loggedIn) {
      router.push('/login');
    }
  }, [userStatus]);

  const createGroup = async (groupName: string, groupPassword: string) => {
    console.log("Making group...");
    await axios.post('/createGroup', {
      groupName: groupName,
      groupPassword: groupPassword,
      token: localStorage.getItem('auth-token')
    }).then(function(){router.push("/groups");
    }).catch(function (error) {
      console.log(error);
    });
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    createGroup(values.groupName, values.groupPassword);
  }

  return (
    <>
      <div className="h-screen w-screen flex justify-center items-center">
        <div className="flex">
          <div className="flex justify-center items-center bg-transparent w-60">
            <p className="text-white text-4xl">
              Create Group
            </p>
          </div>
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-28">
                <FormField
                  control={form.control}
                  name="groupName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input className="w-80" placeholder="Group Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="groupPassword"
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
                  <Button type="submit" className="h-9">Create Group &rarr;</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  )
}