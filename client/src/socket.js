// src/socket.js
//
// One shared socket connection for the whole app, same pattern as your
// shared axios instance in api/axios.js. Import this wherever you need
// live updates instead of creating a new connection per component.

import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
    withCredentials: true,
    autoConnect: false,
});

export default socket;