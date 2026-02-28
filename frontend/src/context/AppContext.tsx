"use client";

import React, {
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

  const login = (email: string, _password: string, role: Role): boolean => {
    // ADMIN (demo)
    if (role === "admin") {
      setUser({ id: "admin001", name: "Administrator", email, role: "admin" });
      return true;
    }

    // JUDGE (demo)
    if (role === "judge") {
      const judge = judgeList.find((j) => j.email === email);

      if (judge) {
        setUser({
          id: judge.id,
          name: judge.name,
          email,
          role: "judge",
          judgeId: judge.id,
        });
        return true;
      }

      // fallback demo
      setUser({
        id: "J001",
        name: "Judge Demo",
        email,
        role: "judge",
        judgeId: "J001",
      });
      return true;
    }

    // PARTICIPANT (demo)
    if (role === "participant") {
      const participant = participantList.find((p) => p.email === email);

      if (participant) {
        setUser({
          id: participant.id,
          name: participant.name,
          email,
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
        email,

        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",

        status: "Pending",
        registeredAt: new Date().toISOString().slice(0, 10),

        scores: [], // ✅ WAJIB ada (sesuai interface Participant)
      };

      setUser({
        id: newParticipant.id,
        name: newParticipant.name,
        email,
        role: "participant",
        participantId: newParticipant.id,
      });

      setCurrentParticipant(newParticipant);

      // optional: kalau mau muncul di admin list
      // setParticipantList((prev) => [newParticipant, ...prev]);

      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setCurrentParticipant(null);
  };

  const value = useMemo<AppContextType>(
    () => ({
      user,
      login,
      logout,

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
    [user, participantList, judgeList, newsList, scoreList, currentParticipant]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}