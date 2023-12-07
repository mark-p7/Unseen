import { io } from 'socket.io-client';

const URL = "http://localhost:8080";

export const socket = io(URL, {
    withCredentials: true,
    extraHeaders: { 
        "my-custom-header": "abcd"
    }
});