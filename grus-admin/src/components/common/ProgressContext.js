import React, { createContext, useContext, useState, useEffect, useRef } from "react";
const config = window.ENV

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const [progress, setProgress] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const pingTimeout = useRef(null);
  const reconnectTimeout = useRef(null);

  const connectWebSocket = () => {
    const ws = new WebSocket(`${config.wsUrl}/ws/progress/${username}`);
    console.log("Connecting to WebSocket...", username);

    ws.onopen = () => {
      console.log("Connected to WebSocket");
      startPing(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("onmessage", data)
      if (data.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      } else {
        if (data.type === "progress") {
          setProgress(prev => [...prev, data]);
        }
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected. Attempting to reconnect...");
      clearTimeout(pingTimeout.current);
      reconnectTimeout.current = setTimeout(() => connectWebSocket(), 5000); // Retry in 5 sec
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws.close();
    };

    setSocket(ws);
  };

  useEffect(() => {
    if (!username) return

    connectWebSocket();
    return () => {
      clearInterval(pingTimeout.current);
      clearTimeout(reconnectTimeout.current);
      socket?.close();
    };
  }, [username]);

  const startPing = (ws) => {
    pingTimeout.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log('Sending ping...');
        ws.send(JSON.stringify({ type: "ping" }));
      } else {
        console.log('Attempting to reconnect...');
        ws.connect()
      }
    }, 30000);
  };

  const startTracking = (taskId) => {
    setProgress([]);
    setOpen(true);
  };

  const closeTracker = () => setOpen(false);
  const openTracker = () => setOpen(true);
  const clearLogs = () => setProgress([]);

  return (
    <ProgressContext.Provider value={{ open, progress, startTracking, closeTracker, openTracker, setUsername, clearLogs }}>
      {children}
    </ProgressContext.Provider>
  );
};
