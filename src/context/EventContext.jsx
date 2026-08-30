import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BACKEND_URL } from "../config/socket.js";
import { useSocket } from "./SocketContext.jsx";

const EventContext = createContext(null);

const emptySession = { mode: "", jumlah_slot: 0, title: "DOORPRIZE" };

function normalizeSession(session) {
  if (!session) return null;
  return {
    id_kelompok: session.id_kelompok,
    jumlah_slot: session.jumlah_slot ?? session.target_jumlah_pemenang ?? 0,
    title: session.title ?? session.nama_kelompok ?? "DOORPRIZE",
    mode: session.mode ?? session.tipe_event ?? "reguler",
  };
}

async function request(path, options) {
  const response = await fetch(`${BACKEND_URL}${path}`, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request gagal: HTTP ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

export function EventProvider({ children }) {
  const { on, off } = useSocket();
  const [appState, setAppState] = useState("STANDBY");
  const [sessionData, setSessionData] = useState(emptySession);
  const [winners, setWinners] = useState([]);
  const [participantPool, setParticipantPool] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [liveSessionId, setLiveSessionId] = useState(null);
  const [isProjectorActive, setIsProjectorActive] = useState(false);

  const syncCurrentState = useCallback(async () => {
    const result = await request("/api/spin/current");
    const current = result.data || {};
    setAppState(current.appState || "STANDBY");
    setSessionData(normalizeSession(current.sessionData) || emptySession);
    setWinners(current.winners || []);
    setLiveSessionId(current.sessionData?.id_kelompok || null);
    setIsProjectorActive(Boolean(current.sessionData));
    return current;
  }, []);

  const loadParticipantPool = useCallback(async () => {
    const result = await request("/api/active");
    const pool = result.data || [];
    setParticipantPool(pool);
    return pool;
  }, []);

  const loadSessions = useCallback(async () => {
    const result = await request("/api/spin/sessions");
    const nextSessions = (result.data || []).map((session) => ({
      ...session,
      status_sesi: session.status_sesi === "complate" ? "completed" : session.status_sesi,
    }));
    setSessions(nextSessions);
    return nextSessions;
  }, []);

  useEffect(() => {
    const handleSpinStarted = (data) => {
      setSessionData(normalizeSession(data) || emptySession);
      setWinners([]);
      setAppState("SPINNING");
    };
    const handleSpinResult = (data) => {
      setWinners(data?.winners || []);
      setAppState("RESULT");
      setSessions((current) => current.map((session) => (
        session.id_kelompok === liveSessionId
          ? { ...session, status_sesi: "completed" }
          : session
      )));
    };
    const handleSessionChanged = (data) => {
      const nextSession = normalizeSession(data) || emptySession;
      setSessionData(nextSession);
      setLiveSessionId(nextSession.id_kelompok || null);
      setIsProjectorActive(true);
      setWinners([]);
      setAppState("STANDBY");
    };
    const handleStageCleared = () => {
      setSessionData(emptySession);
      setWinners([]);
      setAppState("STANDBY");
      setLiveSessionId(null);
      setIsProjectorActive(false);
    };
    const handleAllCompleted = () => {
      setAppState("COMPLETED");
      setSessions((current) => current.map((session) => ({ ...session, status_sesi: "completed" })));
    };

    on("SPIN_STARTED", handleSpinStarted);
    on("SPIN_RESULT", handleSpinResult);
    on("SESSION_CHANGED", handleSessionChanged);
    on("STAGE_CLEARED", handleStageCleared);
    on("ALL_COMPLETED", handleAllCompleted);

    return () => {
      off("SPIN_STARTED", handleSpinStarted);
      off("SPIN_RESULT", handleSpinResult);
      off("SESSION_CHANGED", handleSessionChanged);
      off("STAGE_CLEARED", handleStageCleared);
      off("ALL_COMPLETED", handleAllCompleted);
    };
  }, [liveSessionId, on, off]);

  const setSession = useCallback((session) => request("/api/spin/set-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_kelompok: session.id_kelompok,
      nama_kelompok: session.nama_kelompok ?? session.title,
      jumlah_slot: session.target_jumlah_pemenang ?? session.jumlah_slot,
      mode: session.tipe_event ?? session.mode,
    }),
  }), []);

  const clearStage = useCallback(() => request("/api/spin/clear", { method: "POST" }), []);
  const startSpin = useCallback((session) => request("/api/spin/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_kelompok: session?.id_kelompok,
      nama_kelompok: session?.nama_kelompok ?? session?.title,
      jumlah_slot: session?.target_jumlah_pemenang ?? session?.jumlah_slot,
      mode: session?.tipe_event ?? session?.mode,
    }),
  }), []);
  const stopSpin = useCallback((id_kelompok) => request("/api/spin/stop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_kelompok }),
  }), []);
  const respin = useCallback((session) => request("/api/spin/respin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_kelompok: session.id_kelompok,
      nama_kelompok: session.nama_kelompok ?? session.title,
      jumlah_slot: session.target_jumlah_pemenang ?? session.jumlah_slot,
    }),
  }), []);
  const nextSpin = useCallback((id_kelompok) => request("/api/spin/next", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_kelompok }),
  }), []);

  const value = useMemo(() => ({
    appState,
    sessionData,
    winners,
    participantPool,
    sessions,
    liveSessionId,
    isProjectorActive,
    syncCurrentState,
    loadParticipantPool,
    loadSessions,
    setSession,
    clearStage,
    startSpin,
    stopSpin,
    respin,
    nextSpin,
  }), [
    appState, sessionData, winners, participantPool, sessions, liveSessionId,
    isProjectorActive, syncCurrentState, loadParticipantPool, loadSessions,
    setSession, clearStage, startSpin, stopSpin, respin, nextSpin,
  ]);

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvent() {
  const context = useContext(EventContext);
  if (!context) throw new Error("useEvent must be used within an EventProvider");
  return context;
}
