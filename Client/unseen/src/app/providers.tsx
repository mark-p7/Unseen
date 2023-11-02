'use client';
import { ContextProvider } from "@/context/userContext";
import { ThemeProvider } from "@/app/components/theme-provider"

export function Providers({ children }: any) {
    return (
        <ContextProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
        </ContextProvider>
    );
}