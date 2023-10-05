"use client";
import { Providers } from './providers'
import { Context } from '../context/userContext';
import { useContext } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <>
      <Providers>
        <html lang="en">
          <body>{children}</body>
        </html>
      </Providers>
    </>
  )
}
