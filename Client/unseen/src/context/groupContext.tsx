"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface IGroup {
    title: string;
    id: string;
    imageUrl?: string;
}

interface IGroupContext {
    groups: IGroup[];
    myGroups: IGroup[];
    setMyGroups: React.Dispatch<IGroup[]>;
}

const initialData: IGroupContext = {
    groups: [],
    myGroups: [],
    setMyGroups: () => {},
};

const GroupContext = createContext<IGroupContext>(initialData);

export function useGroup() {
    return useContext(GroupContext);
}

export default function GroupProvider( {children,}: { children: React.ReactNode; } )
{
    const [groups, setGroups] = useState<IGroup[]>([]);
    const [myGroups, setMyGroups] = useState<IGroup[]>([]);

    useEffect(() => {
        // fetchGroupsfromServer();
        fetchMyGroups();
    }, []);

    useEffect(() => {
        updateMyGroups();
    }, [myGroups]);

    // async function fetchGroupsfromServer(): Promise<void> {
    //     const response = await fetch("https://localhost:8080/" + "group-chat");
    //     const groups = await response.json();
    //     setGroups(groups);
    // }


    function fetchMyGroups() {
        const myGroups = localStorage.getItem("myGroups");
        if (myGroups) setMyGroups(JSON.parse(myGroups));
        else setMyGroups([]);
    }

    function updateMyGroups() {
        localStorage.setItem("myGroups", JSON.stringify(myGroups));
    }

    return (
        <GroupContext.Provider value={{ groups, myGroups, setMyGroups }}>
            {children}
        </GroupContext.Provider>
    );
}
