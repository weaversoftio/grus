import React, { createContext, useContext, useState, useEffect, useRef } from "react";
const config = window.ENV
const pingInterval = 10000

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const [progress, setProgress] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false)
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
      const data =JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
        return;
      }

      if (data.type === "progress") {
        setProgress(prev => [...prev, data]);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected. Attempting to reconnect...");
      stopPing();
      reconnectTimeout.current = setTimeout(() => connectWebSocket(), 5000); // Retry in 5 sec
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws.close();
    };

    setSocket(ws);
  };

  const startPing = (ws) => {
    pingTimeout.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
        console.log("Sent ping to server"); 
      }
    }, pingInterval);
  };

  const stopPing = () => {
    if (pingTimeout.current) clearInterval(pingTimeout.current);
  };


  useEffect(() => {
    if (!username) return

    connectWebSocket();
    return () => {
      if (socket) socket.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      stopPing();
    };
  }, [username]);

  
  const startTracking = () => setLoading(true);
  const stopTracking = () => setLoading(false);

  const closeTracker = () => setOpen(false);
  const openTracker = () => setOpen(true);
  const clearLogs = () => setProgress([]);

  return (
    <ProgressContext.Provider value={{ open, progress, loading, startTracking, stopTracking, closeTracker, openTracker, setUsername, clearLogs }}>
      {children}
    </ProgressContext.Provider>
  );
};
