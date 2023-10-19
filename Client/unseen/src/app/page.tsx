"use client";
import { socket } from "@/socket";
import { useContext, useEffect, useState } from "react";
import { Context } from "@/context/userContext";
import { redirect } from 'next/navigation';

export default function Home() {
  const { userStatus, setUserStatus } = useContext(Context);

  // test init
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState<any[]>([]);

  // test inputs
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log(userStatus);
    // Authentication
    if (userStatus != undefined && !userStatus?.loggedIn) {
      return redirect('/login');
    }
  }, [userStatus]);

  useEffect(() => {
    // Socket connection
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value: any) {
      setFooEvents(previous => [...previous, value]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('foo', onFooEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', onFooEvent);
    };
  }, []);

  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  function onSubmit(event: any) {
    event.preventDefault();
    setIsLoading(true);

    socket.timeout(500).emit('chat-message', value, () => {
      setIsLoading(false);
    });
  }

  return (
    <>
      <h1>Home page</h1>
      {userStatus?.loggedIn ? <h1>{userStatus.username}Logged in</h1> : <h1>Not logged in</h1>}
      {fooEvents.map((value, index) => (
        <p key={index}>{value}</p>
      ))}
      <p>Socket is {isConnected ? 'connected' : 'disconnected'}</p>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>

      <form onSubmit={onSubmit}>
        <input onChange={e => setValue(e.target.value)} />

        <button type="submit" disabled={isLoading}>Submit</button>
      </form>
    </>
  )
}
