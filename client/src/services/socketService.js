import { io } from 'socket.io-client';

let socket;

export const initSocket = () => {
  socket = io('http://localhost:5001', {
    withCredentials: false,
  });
  
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const joinComposition = (compositionId) => {
  if (!socket) initSocket();
  socket.emit('join-composition', compositionId);
};

export const updateNote = (data) => {
  if (!socket) initSocket();
  socket.emit('update-note', data);
};

export const onNoteUpdated = (callback) => {
  if (!socket) initSocket();
  socket.on('note-updated', callback);
};

export const disconnect = () => {
  if (socket) socket.disconnect();
};