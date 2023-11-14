import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/app/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react";

interface ModalProps {
    title: string;
    triggerText: string;
    children: React.ReactNode | React.ReactNode[] | JSX.Element | JSX.Element[];
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const Modal = ({ title, children, triggerText, isOpen, setIsOpen }: ModalProps) => {
    return (
        <>
            <Dialog open={isOpen}>
                <DialogTrigger className="mt-4" onClick={() => setIsOpen(!isOpen)}>{triggerText}</DialogTrigger>
                <DialogContent>
                    <DialogPrimitive.Close onClick={() => setIsOpen(!isOpen)} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500 dark:ring-offset-slate-950 dark:focus:ring-slate-300 dark:data-[state=open]:bg-slate-800 dark:data-[state=open]:text-slate-400">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {children}
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
};