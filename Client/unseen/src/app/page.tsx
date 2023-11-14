"use client";
import { socket } from "@/socket";
import { useContext, useEffect, useState } from "react";
import { Context } from "@/context/userContext";
import { redirect } from 'next/navigation';
import axios from "axios";
import { useRouter } from "next/navigation";
import AddGroupPanel from "@/app/components/GroupChat/AddGroupChat";

export default function Home() {
  const { userStatus, setUserStatus } = useContext(Context);
  const router = useRouter();

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

  const logout = async () => {
    await axios.post('/logout', { token: userStatus?.authToken }).then(res => {
      setUserStatus((prevState: any) => ({ ...prevState, loggedIn: false, username: null, authToken: null }));
      localStorage.removeItem('username');
      localStorage.removeItem('auth-token');
      router.push('/login');
    }).catch(err => {
      console.log(err);
    })
  }

  const handleLogout = () => {
    console.log("logging out")
    logout();
  }

  const navigateToGroupChat = () => {
    router.push('/group-chat');
  }

  const [showAddGroupPanel, setShowAddGroupPanel] = useState(false);
  const hideAddGroupPanel = () => setShowAddGroupPanel(false);

  return (
    <>
      <h1>Home page</h1>
      {userStatus?.loggedIn ? <h1>{userStatus.username}Logged in</h1> : <h1>Not logged in</h1>}
      <button onClick={handleLogout}>Logout</button>
      {fooEvents.map((value, index) => (
        <p key={index}>{value}</p>
      ))}
      <p>Socket is {isConnected ? 'connected' : 'disconnected'}</p>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>

      <form onSubmit={onSubmit}>
        <input onChange={e => setValue(e.target.value)} />

        <button type="submit" disabled={isLoading}>Submit</button>
        <button onClick={() => setShowAddGroupPanel(true)}>Go to Group Chat</button>
      </form>
      {showAddGroupPanel && (
          <div>
            <AddGroupPanel hideAddGroupPanel={hideAddGroupPanel} />
          </div>
      )}
    </>
  )
}
