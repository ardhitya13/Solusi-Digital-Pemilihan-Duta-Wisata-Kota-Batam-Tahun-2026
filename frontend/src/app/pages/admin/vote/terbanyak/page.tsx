"use client";

import React from "react";
import Image from "next/image";
import { Heart, Save, Globe, Link as LinkIcon } from "lucide-react";
import GoldCard from "../../../../../components/dashboard/GoldCard";
import { GoldButton } from "../../../../../components/ui/GoldButton";
import { useApp, type VoteTopItem } from "../../../../../context/AppContext";

type RankValue = 1 | 2 | 3;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

export default function AdminVoteTopPage() {
  const {
    voteCandidateList,
    setVoteCandidateList,
    voteTopList,
    setVoteTopList,
    voteTopPublished,
    setVoteTopPublished,
  } = useApp();

  const updateCandidateField = (
    id: string,
    key: "instagramProfileUrl" | "instagramPostUrl" | "instagramHandle",
    value: string
  ) => {
    setVoteCandidateList((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const updateCandidatePhoto = async (id: string, file: File | null) => {
    if (!file) return;
    const src = await readFileAsDataUrl(file);
    setVoteCandidateList((prev) => prev.map((item) => (item.id === id ? { ...item, photo: src } : item)));
  };

  const updateTopItem = (rank: RankValue, next: Partial<VoteTopItem>) => {
    setVoteTopList((prev) => prev.map((item) => (item.rank === rank ? { ...item, ...next } : item)));
  };

  const handleSelectCandidateForRank = (rank: RankValue, participantId: string) => {
    const candidate = voteCandidateList.find((item) => item.participantId === participantId);
    if (!candidate) return;
    updateTopItem(rank, {
      participantId: candidate.participantId,
      number: candidate.number,
      name: candidate.name,
      gender: candidate.gender,
      photo: candidate.photo,
      instagramHandle: candidate.instagramHandle,
      instagramProfileUrl: candidate.instagramProfileUrl,
      instagramPostUrl: candidate.instagramPostUrl,
    });
  };

  const applyAutoTop = () => {
    const top = voteCandidateList
      .filter((item) => item.enabled)
      .slice(0, 3)
      .map((candidate, index) => ({
        id: `vt-${index + 1}`,
        participantId: candidate.participantId,
        number: candidate.number,
        name: candidate.name,
        gender: candidate.gender,
        photo: candidate.photo,
        instagramHandle: candidate.instagramHandle,
        instagramProfileUrl: candidate.instagramProfileUrl,
        instagramPostUrl: candidate.instagramPostUrl,
        voteCount: 0,
        rank: (index + 1) as RankValue,
      }));

    if (top.length === 3) setVoteTopList(top);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 style={{ fontFamily: "var(--font-cinzel)", color: "#D4AF37", fontSize: "1.5rem", fontWeight: 700 }}>
          Vote Terbanyak
        </h1>
        <p className="text-sm mt-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
          Input manual vote Instagram dan publikasi ranking vote terbanyak.
        </p>
      </div>

      <GoldCard glow className="mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold" style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}>
              Status Publikasi
            </p>
            <p className="text-xs mt-1" style={{ color: "#9CA3AF", fontFamily: "var(--font-poppins)" }}>
              Aktifkan jika blok &quot;Vote Terbanyak&quot; ingin tampil di halaman publik.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVoteTopPublished((prev) => !prev)}
            className="px-4 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: voteTopPublished ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
              border: `1px solid ${voteTopPublished ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`,
              color: voteTopPublished ? "#22c55e" : "#ef4444",
              fontFamily: "var(--font-poppins)",
            }}
          >
            {voteTopPublished ? "Dipublikasikan" : "Belum Dipublikasikan"}
          </button>
        </div>
      </GoldCard>

      <GoldCard className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}>
            Kandidat Voting Instagram
          </h3>
          <GoldButton variant="outline" size="sm" onClick={applyAutoTop}>
            <Save size={14} />
            Isi Top 3 Otomatis
          </GoldButton>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {voteCandidateList.map((candidate) => (
            <div key={candidate.id} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.16)" }}>
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ border: "1px solid rgba(212,175,55,0.28)" }}>
                  <Image src={candidate.photo} alt={candidate.name} fill unoptimized className="object-cover object-top" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate" style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}>
                    {candidate.name}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#9CA3AF", fontFamily: "var(--font-poppins)" }}>
                    {candidate.number} - {candidate.gender}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <label className="block text-[11px]" style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)" }}>
                  Ubah Foto Publikasi
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-xs px-3 py-2 rounded-lg"
                  style={{ background: "#111", border: "1px solid rgba(212,175,55,0.2)", color: "#D1D5DB" }}
                  onChange={(event) => updateCandidatePhoto(candidate.id, event.target.files?.[0] ?? null)}
                />
              </div>

              <div className="mt-2 space-y-2">
                <div>
                  <label className="text-[11px] flex items-center gap-1" style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)" }}>
                    <Globe size={11} /> Link IG Peserta
                  </label>
                  <input
                    type="text"
                    value={candidate.instagramProfileUrl}
                    onChange={(event) => updateCandidateField(candidate.id, "instagramProfileUrl", event.target.value)}
                    placeholder="https://instagram.com/username"
                    className="w-full mt-1 px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: "#111", border: "1px solid rgba(212,175,55,0.2)", color: "#F5E6C8" }}
                  />
                </div>
                <div>
                  <label className="text-[11px] flex items-center gap-1" style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)" }}>
                    <LinkIcon size={11} /> Link Postingan Vote Duta Wisata
                  </label>
                  <input
                    type="text"
                    value={candidate.instagramPostUrl}
                    onChange={(event) => updateCandidateField(candidate.id, "instagramPostUrl", event.target.value)}
                    placeholder="https://instagram.com/p/xxxx"
                    className="w-full mt-1 px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: "#111", border: "1px solid rgba(212,175,55,0.2)", color: "#F5E6C8" }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <label className="text-xs" style={{ color: "#9CA3AF", fontFamily: "var(--font-poppins)" }}>
                  Tampilkan di halaman vote
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setVoteCandidateList((prev) =>
                      prev.map((item) => (item.id === candidate.id ? { ...item, enabled: !item.enabled } : item))
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    background: candidate.enabled ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    color: candidate.enabled ? "#22c55e" : "#ef4444",
                    border: `1px solid ${candidate.enabled ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`,
                    fontFamily: "var(--font-poppins)",
                  }}
                >
                  {candidate.enabled ? "Aktif" : "Nonaktif"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </GoldCard>

      <GoldCard>
        <h3 className="text-sm font-bold mb-4" style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}>
          Input Manual Ranking Vote Terbanyak
        </h3>
        <div className="space-y-3">
          {([1, 2, 3] as RankValue[]).map((rank) => {
            const item = voteTopList.find((entry) => entry.rank === rank);
            const activeCandidate = voteCandidateList.find((candidate) => candidate.participantId === item?.participantId);
            return (
              <div key={rank} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.16)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(212,175,55,0.2)", color: "#D4AF37" }}>
                    {rank}
                  </div>
                  <select
                    value={item?.participantId ?? ""}
                    onChange={(event) => handleSelectCandidateForRank(rank, event.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: "#111", border: "1px solid rgba(212,175,55,0.2)", color: "#F5E6C8" }}
                  >
                    <option value="">Pilih Peserta</option>
                    {voteCandidateList
                      .filter((candidate) => candidate.enabled)
                      .map((candidate) => (
                        <option key={candidate.id} value={candidate.participantId}>
                          {candidate.number} - {candidate.name}
                        </option>
                      ))}
                  </select>
                  <div className="w-44">
                    <input
                      type="number"
                      min={0}
                      value={item?.voteCount ?? 0}
                      onChange={(event) => updateTopItem(rank, { voteCount: Number(event.target.value || 0) })}
                      className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                      style={{ background: "#111", border: "1px solid rgba(212,175,55,0.2)", color: "#F5E6C8" }}
                    />
                  </div>
                </div>
                {activeCandidate ? (
                  <p className="text-xs mt-2" style={{ color: "#9CA3AF", fontFamily: "var(--font-poppins)" }}>
                    Instagram: {activeCandidate.instagramHandle || "@-"}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <GoldButton variant="primary" size="sm">
            <Heart size={14} />
            Data Vote Tersimpan
          </GoldButton>
        </div>
      </GoldCard>
    </div>
  );
}
