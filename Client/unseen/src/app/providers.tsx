'use client';
import { ContextProvider } from "@/context/userContext";

export function Providers({ children }: any) {
    return (
        <ContextProvider>
            {children}
        </ContextProvider>
    );
}