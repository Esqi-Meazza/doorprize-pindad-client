import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { socket } from "../config/socket.js";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectionError, setConnectionError] = useState(null);
  const on = useCallback((eventName, handler) => socket.on(eventName, handler), []);
  const off = useCallback((eventName, handler) => socket.off(eventName, handler), []);
  const emit = useCallback((eventName, payload) => socket.emit(eventName, payload), []);
  const reconnect = useCallback(() => socket.connect(), []);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };
    const handleDisconnect = (reason) => {
      setIsConnected(false);
      setConnectionError(reason || null);
    };
    const handleConnectError = (error) => {
      setIsConnected(false);
      setConnectionError(error);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, []);

  const value = useMemo(() => ({
    socket,
    isConnected,
    connectionError,
    on,
    off,
    emit,
    reconnect,
  }), [isConnected, connectionError, on, off, emit, reconnect]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
}
