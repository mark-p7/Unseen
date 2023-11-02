"use client";
import { Providers } from './providers'
import { Context } from '../context/userContext';
import { useContext } from 'react';
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </>
  )
}
