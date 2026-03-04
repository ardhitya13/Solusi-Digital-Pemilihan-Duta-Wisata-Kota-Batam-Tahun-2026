"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Trophy, Medal, CheckCircle } from "lucide-react";
import GoldCard from "../../../../../components/dashboard/GoldCard";
import { GoldButton } from "../../../../../components/ui/GoldButton";
import { useApp } from "../../../../../context/AppContext";
import { criteriaList } from "../../../../../data/mockData";

type RankValue = 1 | 2 | 3;

function normalizeStageName(stageName: string) {
  return stageName.toLowerCase().replace(/[\s-]/g, "");
}

export default function AdminVoteJuryPage() {
  const {
    participantList,
    scoreList,
    judgeWinnerList,
    setJudgeWinnerList,
    judgeWinnersPublished,
    setJudgeWinnersPublished,
  } = useApp();

  const finalCandidates = useMemo(() => {
    return participantList.filter((participant) => participant.status === "GrandFinal" || participant.status === "Winner");
  }, [participantList]);

  const computedRanking = useMemo(() => {
    return finalCandidates
      .map((participant, index) => {
        const finals = scoreList.filter(
          (score) =>
            score.participantId === participant.id &&
            normalizeStageName(score.stage) === normalizeStageName("Grand Final")
        );

        const totalScore =
          finals.length > 0
            ? finals.reduce((sum, item) => sum + item.totalScore, 0) / finals.length
            : criteriaList.reduce((sum, _, criteriaIndex) => {
                const seed = participant.id.charCodeAt(participant.id.length - 1) + criteriaIndex + index;
                const fallback = 70 + ((seed * 17 + 11) % 26);
                return sum + fallback / criteriaList.length;
              }, 0);

        return {
          participant,
          totalScore: Math.round(totalScore * 100) / 100,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [finalCandidates, scoreList]);

  const applyAutoWinners = () => {
    const top3 = computedRanking.slice(0, 3).map((item, index) => ({
      id: `jw-${index + 1}`,
      participantId: item.participant.id,
      number: item.participant.number,
      name: item.participant.name,
      gender: item.participant.gender,
      photo: item.participant.photo,
      instagramHandle: item.participant.instagram,
      totalScore: item.totalScore,
      rank: (index + 1) as RankValue,
    }));
    setJudgeWinnerList(top3);
  };

  const setWinnerByRank = (rank: RankValue, participantId: string) => {
    const item = computedRanking.find((entry) => entry.participant.id === participantId);
    if (!item) return;
    setJudgeWinnerList((prev) => {
      const existing = prev.filter((winner) => winner.rank !== rank);
      return [
        ...existing,
        {
          id: `jw-${rank}`,
          participantId: item.participant.id,
          number: item.participant.number,
          name: item.participant.name,
          gender: item.participant.gender,
          photo: item.participant.photo,
          instagramHandle: item.participant.instagram,
          totalScore: item.totalScore,
          rank,
        },
      ].sort((a, b) => a.rank - b.rank);
    });
  };

  const getWinner = (rank: RankValue) => judgeWinnerList.find((winner) => winner.rank === rank);

  return (
    <div>
      <div className="mb-8">
        <h1 style={{ fontFamily: "var(--font-cinzel)", color: "#D4AF37", fontSize: "1.5rem", fontWeight: 700 }}>
          Juara Versi Juri
        </h1>
        <p className="text-sm mt-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
          Publish juara 1, 2, 3 berdasarkan akumulasi nilai juri ketika sudah waktunya.
        </p>
      </div>

      <GoldCard glow className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold" style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}>
              Status Publikasi Juara Juri
            </p>
            <p className="text-xs mt-1" style={{ color: "#9CA3AF", fontFamily: "var(--font-poppins)" }}>
              Jika nonaktif, section juara versi juri disembunyikan di halaman publik.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setJudgeWinnersPublished((prev) => !prev)}
            className="px-4 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: judgeWinnersPublished ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
              border: `1px solid ${judgeWinnersPublished ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`,
              color: judgeWinnersPublished ? "#22c55e" : "#ef4444",
              fontFamily: "var(--font-poppins)",
              cursor: "pointer",
            }}
          >
            {judgeWinnersPublished ? "Dipublikasikan" : "Belum Dipublikasikan"}
          </button>
        </div>
      </GoldCard>

      <GoldCard className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="text-sm font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}>
            Akumulasi Nilai Grand Final
          </h3>
          <GoldButton variant="primary" size="sm" onClick={applyAutoWinners}>
            <Trophy size={14} />
            Isi Juara Otomatis
          </GoldButton>
        </div>
        <div className="space-y-2">
          {computedRanking.slice(0, 10).map((row, index) => (
            <div
              key={row.participant.id}
              className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.15)" }}
            >
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(212,175,55,0.18)", color: "#D4AF37" }}>
                {index + 1}
              </span>
              <div className="relative w-10 h-10 rounded-full overflow-hidden" style={{ border: "1px solid rgba(212,175,55,0.25)" }}>
                <Image src={row.participant.photo} alt={row.participant.name} fill unoptimized className="object-cover object-top" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate" style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}>
                  {row.participant.name}
                </p>
                <p className="text-xs mt-1" style={{ color: "#9CA3AF", fontFamily: "var(--font-poppins)" }}>
                  {row.participant.number} • {row.totalScore.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GoldCard>

      <GoldCard>
        <h3 className="text-sm font-bold mb-4" style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}>
          Penetapan Juara 1, 2, 3
        </h3>
        <div className="space-y-3">
          {([1, 2, 3] as RankValue[]).map((rank) => {
            const winner = getWinner(rank);
            return (
              <div key={rank} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.16)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(212,175,55,0.2)", color: "#D4AF37" }}>
                    <Medal size={14} />
                  </div>
                  <div className="text-xs font-semibold" style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}>
                    Juara {rank}
                  </div>
                  <select
                    value={winner?.participantId ?? ""}
                    onChange={(event) => setWinnerByRank(rank, event.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: "#111", border: "1px solid rgba(212,175,55,0.2)", color: "#F5E6C8" }}
                  >
                    <option value="">Pilih Peserta</option>
                    {computedRanking.map((row) => (
                      <option key={row.participant.id} value={row.participant.id}>
                        {row.participant.number} - {row.participant.name}
                      </option>
                    ))}
                  </select>
                </div>
                {winner ? (
                  <p className="text-xs mt-2" style={{ color: "#9CA3AF", fontFamily: "var(--font-poppins)" }}>
                    Nilai akumulasi: {winner.totalScore.toFixed(2)}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <GoldButton variant="primary" size="sm">
            <CheckCircle size={14} />
            Penetapan Juara Tersimpan
          </GoldButton>
        </div>
      </GoldCard>
    </div>
  );
}
