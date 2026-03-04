"use client";

import React, {
  useCallback,
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  type Participant,
  type Judge,
  type NewsItem,
  type ScoreRecord, // ✅ INI YANG BENAR (bukan Score)
  mockParticipants,
  mockJudges,
  mockNews,
  mockScores, // ✅ ini harus ScoreRecord[]
} from "../data/mockData";

export type Role = "participant" | "admin" | "judge";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  participantId?: string;
  judgeId?: string;
};

type AppContextType = {
  user: AuthUser | null;
  login: (email: string, password: string, role: Role) => boolean;
  logout: () => void;
  setPasswordForEmail: (email: string, password: string) => void;
  requestPasswordReset: (email: string) => boolean;
  resetPasswordWithOtp: (email: string, _otp: string, newPassword: string) => boolean;
  changePassword: (email: string, currentPassword: string, newPassword: string) => boolean;

  participantList: Participant[];
  setParticipantList: React.Dispatch<React.SetStateAction<Participant[]>>;

  judgeList: Judge[];

  newsList: NewsItem[];
  setNewsList: React.Dispatch<React.SetStateAction<NewsItem[]>>;

  scoreList: ScoreRecord[]; // ✅ INI YANG BENAR
  setScoreList: React.Dispatch<React.SetStateAction<ScoreRecord[]>>;

  currentParticipant: Participant | null;
  setCurrentParticipant: React.Dispatch<
    React.SetStateAction<Participant | null>
  >;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [participantList, setParticipantList] =
    useState<Participant[]>(mockParticipants);

  const [judgeList] = useState<Judge[]>(mockJudges);

  const [newsList, setNewsList] = useState<NewsItem[]>(mockNews);

  // ✅ mockScores itu array ScoreRecord, bukan Score
  const [scoreList, setScoreList] = useState<ScoreRecord[]>(mockScores);

  const [currentParticipant, setCurrentParticipant] =
    useState<Participant | null>(null);

  const [passwordStore, setPasswordStore] = useState<Record<string, string>>({
    "admin@dutawisatabatam.id": "admin123",
    "juri1@dutawisatabatam.id": "demo123",
    "ahmadrizky@email.com": "demo123",
  });

  const getDefaultPasswordByRole = useCallback((role: Role) => {
    if (role === "admin") return "admin123";
    return "demo123";
  }, []);

  const resolveStoredPassword = useCallback(
    (email: string, role: Role) => {
      return passwordStore[email] ?? getDefaultPasswordByRole(role);
    },
    [passwordStore, getDefaultPasswordByRole]
  );

  const setPasswordForEmail = useCallback((email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;
    setPasswordStore((prev) => ({ ...prev, [normalized]: password }));
  }, []);

  const requestPasswordReset = useCallback((email: string): boolean => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return false;

    const emailKnown =
      Boolean(participantList.find((p) => p.email.toLowerCase() === normalized)) ||
      Boolean(judgeList.find((j) => j.email.toLowerCase() === normalized)) ||
      normalized === "admin@dutawisatabatam.id" ||
      Boolean(passwordStore[normalized]);

    return emailKnown;
  }, [participantList, judgeList, passwordStore]);

  const resetPasswordWithOtp = useCallback((email: string, _otp: string, newPassword: string): boolean => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || newPassword.length < 8) return false;
    setPasswordStore((prev) => ({ ...prev, [normalized]: newPassword }));
    return true;
  }, []);

  const changePassword = useCallback(
    (email: string, currentPassword: string, newPassword: string): boolean => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || newPassword.length < 8) return false;

      const knownRole = normalized === "admin@dutawisatabatam.id"
        ? "admin"
        : judgeList.some((j) => j.email.toLowerCase() === normalized)
        ? "judge"
        : "participant";
      const activePassword = resolveStoredPassword(normalized, knownRole);
      if (activePassword !== currentPassword) return false;

      setPasswordStore((prev) => ({ ...prev, [normalized]: newPassword }));
      return true;
    },
    [judgeList, resolveStoredPassword]
  );

  const login = useCallback((email: string, password: string, role: Role): boolean => {
    const normalizedEmail = email.trim().toLowerCase();
    const activePassword = resolveStoredPassword(normalizedEmail, role);
    if (activePassword !== password) {
      return false;
    }

    // ADMIN (demo)
    if (role === "admin") {
      setUser({ id: "admin001", name: "Administrator", email: normalizedEmail, role: "admin" });
      return true;
    }

    // JUDGE (demo)
    if (role === "judge") {
      const judge = judgeList.find((j) => j.email.toLowerCase() === normalizedEmail);

      if (judge) {
        setUser({
          id: judge.id,
          name: judge.name,
          email: normalizedEmail,
          role: "judge",
          judgeId: judge.id,
        });
        return true;
      }

      // fallback demo
      setUser({
        id: "J001",
        name: "Judge Demo",
        email: normalizedEmail,
        role: "judge",
        judgeId: "J001",
      });
      return true;
    }

    // PARTICIPANT (demo)
    if (role === "participant") {
      const participant = participantList.find((p) => p.email.toLowerCase() === normalizedEmail);

      if (participant) {
        setUser({
          id: participant.id,
          name: participant.name,
          email: normalizedEmail,
          role: "participant",
          participantId: participant.id,
        });
        setCurrentParticipant(participant);
        return true;
      }

      // ✅ create demo participant session (HARUS sesuai type Participant)
      const newParticipant: Participant = {
        id: "P_DEMO",
        number: `P-${Math.floor(Math.random() * 900 + 100)}`,
        name: "Demo Participant",

        gender: "Encik", // ✅ HARUS "Encik" / "Puan", BUKAN "Male"

        nationalId: "",
        birthPlace: "",
        birthDate: "",
        heightCm: 0, // ✅ field bener: heightCm (bukan height)
        education: "",
        instagram: "",
        phone: "",
        email: normalizedEmail,

        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",

        status: "Pending",
        registeredAt: new Date().toISOString().slice(0, 10),

        scores: [], // ✅ WAJIB ada (sesuai interface Participant)
      };

      setUser({
        id: newParticipant.id,
        name: newParticipant.name,
        email: normalizedEmail,
        role: "participant",
        participantId: newParticipant.id,
      });

      setCurrentParticipant(newParticipant);

      // optional: kalau mau muncul di admin list
      // setParticipantList((prev) => [newParticipant, ...prev]);

      return true;
    }

    return false;
  }, [resolveStoredPassword, judgeList, participantList]);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentParticipant(null);
  }, []);

  const value = useMemo<AppContextType>(
    () => ({
      user,
      login,
      logout,
      setPasswordForEmail,
      requestPasswordReset,
      resetPasswordWithOtp,
      changePassword,

      participantList,
      setParticipantList,

      judgeList,

      newsList,
      setNewsList,

      scoreList,
      setScoreList,

      currentParticipant,
      setCurrentParticipant,
    }),
    [
      user,
      login,
      logout,
      setPasswordForEmail,
      requestPasswordReset,
      resetPasswordWithOtp,
      changePassword,
      participantList,
      judgeList,
      newsList,
      scoreList,
      currentParticipant,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
