"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Trophy, Crown } from "lucide-react";
import GoldCard from "../../../../components/dashboard/GoldCard";
import { useApp } from "../../../../context/AppContext";
import { criteriaList, stages, type Participant } from "../../../../data/mockData";

type GenderFilter = "Semua" | "Encik" | "Puan";

type RankedParticipant = Participant & {
  score: number;
};

const stageStatusMap: Record<string, string[]> = {
  Audition: ["Audition", "Verified", "Top20", "PreCamp", "Camp", "GrandFinal", "Winner"],
  "Pre-Camp": ["PreCamp", "Camp", "GrandFinal", "Winner"],
  Camp: ["Camp", "GrandFinal", "Winner"],
  "Grand Final": ["GrandFinal", "Winner"],
};

function normalizeStageName(stageName: string) {
  return stageName.toLowerCase().replace(/[\s-]/g, "");
}

function generateFallbackScore(participantId: string, stageName: string) {
  const lastChar = participantId.charCodeAt(participantId.length - 1) || 75;
  const stageSeed = stageName.length * 3;
  return Math.min(100, Math.max(60, 75 + ((lastChar + stageSeed) % 20)));
}

export default function AdminScoresPage() {
  const { participantList, judgeList, scoreList } = useApp();
  const [activeStage, setActiveStage] = useState("Grand Final");
  const [activeGender, setActiveGender] = useState<GenderFilter>("Semua");

  const validStatuses = useMemo(() => stageStatusMap[activeStage] ?? [], [activeStage]);

  const participants = useMemo(() => {
    return participantList.filter(
      (participant) =>
        validStatuses.includes(participant.status) &&
        (activeGender === "Semua" || participant.gender === activeGender)
    );
  }, [activeGender, participantList, validStatuses]);

  const rankings = useMemo<RankedParticipant[]>(() => {
    const normalizedActiveStage = normalizeStageName(activeStage);

    return participants
      .map((participant) => {
        const stageScores = scoreList.filter(
          (score) =>
            score.participantId === participant.id &&
            normalizeStageName(score.stage) === normalizedActiveStage
        );

        const computedScore =
          stageScores.length > 0
            ? stageScores.reduce((sum, item) => sum + item.totalScore, 0) / stageScores.length
            : generateFallbackScore(participant.id, activeStage);

        return {
          ...participant,
          score: Math.round(computedScore * 10) / 10,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [activeStage, participants, scoreList]);

  const judgesForStage = useMemo(() => {
    const normalizedActiveStage = normalizeStageName(activeStage);
    return judgeList.filter((judge) =>
      judge.stages.some((stage) => normalizeStageName(stage).includes(normalizedActiveStage))
    );
  }, [activeStage, judgeList]);

  return (
    <div>
      <div className="mb-8">
        <h1
          style={{
            fontFamily: "var(--font-cinzel)",
            color: "#D4AF37",
            fontSize: "1.5rem",
            fontWeight: 700,
          }}
        >
          Tahapan & Nilai
        </h1>
        <p className="text-sm mt-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
          Rekap nilai dan ranking peserta per tahap seleksi
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background:
                  activeStage === stage
                    ? "linear-gradient(135deg, #F5D06F, #D4AF37)"
                    : "rgba(212,175,55,0.08)",
                color: activeStage === stage ? "#0F0F0F" : "#D4AF37",
                border: `1px solid ${activeStage === stage ? "transparent" : "rgba(212,175,55,0.2)"}`,
                fontFamily: "var(--font-cinzel)",
                cursor: "pointer",
              }}
              type="button"
            >
              {stage}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["Semua", "Encik", "Puan"] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => setActiveGender(gender)}
              className="px-4 py-2 rounded-xl text-xs transition-all"
              style={{
                background: activeGender === gender ? "rgba(212,175,55,0.15)" : "transparent",
                border: `1px solid ${activeGender === gender ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}`,
                color: activeGender === gender ? "#D4AF37" : "#888",
                fontFamily: "var(--font-poppins)",
                cursor: "pointer",
              }}
              type="button"
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GoldCard glow>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}>
                Ranking Tahap {activeStage}
              </h3>
              <span className="text-xs" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
                {rankings.length} peserta
              </span>
            </div>

            {rankings.length === 0 ? (
              <div className="py-8 text-center">
                <Trophy size={32} style={{ color: "#444", margin: "0 auto 12px" }} />
                <p className="text-sm" style={{ color: "#666", fontFamily: "var(--font-poppins)" }}>
                  Belum ada peserta di tahap ini
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {rankings.map((participant, index) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-4 p-3 rounded-xl transition-all"
                    style={{
                      background:
                        index === 0
                          ? "rgba(212,175,55,0.12)"
                          : index === 1
                          ? "rgba(192,192,192,0.08)"
                          : index === 2
                          ? "rgba(205,127,50,0.08)"
                          : "rgba(255,255,255,0.02)",
                      border: `1px solid ${index === 0 ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.05)"}`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        background:
                          index === 0
                            ? "linear-gradient(135deg, #F5D06F, #D4AF37)"
                            : index === 1
                            ? "linear-gradient(135deg, #C0C0C0, #A8A8A8)"
                            : index === 2
                            ? "linear-gradient(135deg, #CD7F32, #A0522D)"
                            : "rgba(255,255,255,0.08)",
                        color: index < 3 ? "#0F0F0F" : "#888",
                        fontFamily: "var(--font-cinzel)",
                      }}
                    >
                      {index + 1}
                    </div>

                    <Image
                      src={participant.photo}
                      alt={participant.name}
                      width={36}
                      height={36}
                      unoptimized
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}>
                        {participant.name}
                      </p>
                      <p className="text-xs" style={{ color: "#888" }}>
                        {participant.number} • {participant.gender}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className="text-base font-bold"
                        style={{ color: index === 0 ? "#D4AF37" : "#F5E6C8", fontFamily: "var(--font-cinzel)" }}
                      >
                        {participant.score.toFixed(1)}
                      </p>
                      <p className="text-xs" style={{ color: "#666", fontFamily: "var(--font-poppins)" }}>
                        Nilai
                      </p>
                    </div>

                    {index < 3 ? (
                      <Crown
                        size={16}
                        style={{
                          color: index === 0 ? "#D4AF37" : index === 1 ? "#C0C0C0" : "#CD7F32",
                        }}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </GoldCard>
        </div>

        <div>
          <GoldCard>
            <h3 className="text-sm font-bold mb-4" style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}>
              Juri Tahap {activeStage}
            </h3>
            <div className="space-y-3">
              {(judgesForStage.length > 0 ? judgesForStage : judgeList).map((judge) => (
                <div
                  key={judge.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <Image
                    src={judge.avatar}
                    alt={judge.name}
                    width={36}
                    height={36}
                    unoptimized
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}>
                      {judge.name}
                    </p>
                    <p className="text-xs" style={{ color: "#888" }}>
                      {judge.title}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {judge.stages.map((stage) => (
                        <span
                          key={stage}
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            background: "rgba(212,175,55,0.1)",
                            color: "#D4AF37",
                            fontFamily: "var(--font-poppins)",
                            fontSize: "10px",
                          }}
                        >
                          {stage}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GoldCard>

          <GoldCard className="mt-4">
            <h3 className="text-sm font-bold mb-4" style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}>
              Kriteria Penilaian
            </h3>
            <div className="space-y-2">
              {criteriaList.map((criteria) => (
                <div key={criteria.key} className="flex justify-between items-center">
                  <p className="text-xs" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
                    {criteria.label}
                  </p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2"
                    style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}
                  >
                    {criteria.weight}%
                  </span>
                </div>
              ))}
            </div>
          </GoldCard>
        </div>
      </div>
    </div>
  );
}
