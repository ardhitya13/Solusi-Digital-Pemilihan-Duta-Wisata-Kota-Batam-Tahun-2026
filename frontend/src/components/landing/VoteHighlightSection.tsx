"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Crown, Instagram } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GoldButton } from "../ui/GoldButton";

function modulo(index: number, length: number) {
  if (length === 0) return 0;
  return ((index % length) + length) % length;
}

export default function VoteHighlightSection() {
  const { participantList, scoreList } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbPage, setThumbPage] = useState(0);
  const [thumbsPerPage, setThumbsPerPage] = useState(10);

  const finalists = useMemo(() => {
    const getDisplayOrder = (photoPath: string, fallbackNumber: string) => {
      const photoMatch = photoPath.match(/\/(\d+)\.(jpg|jpeg|png|webp)$/i);
      if (photoMatch) return Number.parseInt(photoMatch[1], 10);

      const numberMatch = fallbackNumber.match(/(\d+)$/);
      if (numberMatch) return Number.parseInt(numberMatch[1], 10);

      return Number.MAX_SAFE_INTEGER;
    };

    return participantList
      .filter((p) => p.status === "GrandFinal" || p.status === "Winner")
      .sort(
        (a, b) =>
          getDisplayOrder(a.photo, a.number) - getDisplayOrder(b.photo, b.number)
      );
  }, [participantList]);

  const ranking = finalists;
  const hasData = ranking.length > 0;
  const safeActive = modulo(activeIndex, ranking.length);
  const totalThumbPages = Math.max(1, Math.ceil(ranking.length / thumbsPerPage));
  const safeThumbPage = modulo(thumbPage, totalThumbPages);
  const thumbStart = safeThumbPage * thumbsPerPage;
  const visibleThumbs = ranking.slice(thumbStart, thumbStart + thumbsPerPage);

  const center = ranking[safeActive];
  const left = ranking[modulo(safeActive - 1, ranking.length)];
  const right = ranking[modulo(safeActive + 1, ranking.length)];

  const juryRanking = useMemo(() => {
    const finalistsById = new Set(finalists.map((p) => p.id));
    const scoreMap = new Map<string, { total: number; count: number }>();

    scoreList.forEach((record) => {
      if (!finalistsById.has(record.participantId)) return;
      const existing = scoreMap.get(record.participantId) ?? { total: 0, count: 0 };
      scoreMap.set(record.participantId, {
        total: existing.total + record.totalScore,
        count: existing.count + 1,
      });
    });

    const withScore = finalists
      .map((p) => {
        const aggregate = scoreMap.get(p.id);
        const avg = aggregate ? aggregate.total / aggregate.count : null;
        return { participant: p, avg };
      })
      .sort((a, b) => {
        const aScore = a.avg ?? -1;
        const bScore = b.avg ?? -1;
        if (bScore !== aScore) return bScore - aScore;
        if (a.participant.status !== b.participant.status) {
          return a.participant.status === "Winner" ? -1 : 1;
        }
        return (b.participant.likes ?? 0) - (a.participant.likes ?? 0);
      });

    return withScore.slice(0, 3);
  }, [finalists, scoreList]);

  const voteRanking = useMemo(() => {
    return [...finalists].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 3);
  }, [finalists]);

  const goPrev = () => setActiveIndex((prev) => prev - 1);
  const goNext = () => setActiveIndex((prev) => prev + 1);
  const goPrevThumbPage = () => setThumbPage((prev) => prev - 1);
  const goNextThumbPage = () => setThumbPage((prev) => prev + 1);

  useEffect(() => {
    if (ranking.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => prev + 1);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [ranking.length]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) setThumbsPerPage(5);
      else if (w < 1024) setThumbsPerPage(8);
      else setThumbsPerPage(10);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (ranking.length === 0) return;
    const targetPage = Math.floor(safeActive / thumbsPerPage);
    setThumbPage(targetPage);
  }, [safeActive, ranking.length, thumbsPerPage]);

  const cardBaseStyle: React.CSSProperties = {
    background: "#1A1A1A",
    border: "1px solid rgba(200,162,77,0.28)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
  };

  return (
    <section id="vote" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p
            className="text-sm tracking-widest uppercase mb-3"
            style={{ color: "#C8A24D", fontFamily: "var(--font-cinzel)" }}
          >
            Duta Wisata Batam 2026
          </p>
          <h2
            style={{
              fontFamily: "var(--font-cinzel)",
              background: "linear-gradient(135deg, #F5D06F, #C8A24D)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
            }}
          >
            HIGHLIGHT FINALIS & JUARA
          </h2>
        </div>

        {!hasData ? (
          <div className="text-center py-14 rounded-2xl" style={cardBaseStyle}>
            <Crown size={42} style={{ color: "#C8A24D", margin: "0 auto 12px", opacity: 0.7 }} />
            <p style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
              Data finalis belum tersedia.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-7">
              {[left, center, right].map((item, idx) => {
                const isCenter = idx === 1;
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className="relative overflow-hidden rounded-2xl text-left transition-transform duration-300"
                    style={{
                      ...cardBaseStyle,
                      transform: isCenter ? "scale(1)" : "scale(0.94)",
                      opacity: isCenter ? 1 : 0.8,
                    }}
                  >
                    <div className={isCenter ? "h-[420px]" : "h-[360px]"}>
                      <img src={item.photo} alt={item.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.78) 86%, rgba(0,0,0,0.92) 100%)",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p style={{ color: "#F5E6C8", fontFamily: "var(--font-cinzel)", fontWeight: 700 }}>
                        {item.name}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "#C8A24D", fontFamily: "var(--font-poppins)" }}
                      >
                        {item.number} • {item.gender}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <a
                          href={`https://instagram.com/${item.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                          style={{
                            background: "linear-gradient(135deg, #F5D06F, #C8A24D)",
                            color: "#0F0F0F",
                            fontFamily: "var(--font-poppins)",
                            fontWeight: 600,
                          }}
                        >
                          <Instagram size={12} />
                          Vote IG
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-3 mb-7">
              <button
                type="button"
                onClick={goPrev}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(200,162,77,0.12)", color: "#C8A24D" }}
                aria-label="Sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>

              <GoldButton variant="primary" size="sm" onClick={() => window.location.assign("/vote")}>
                Selengkapnya
              </GoldButton>

              <button
                type="button"
                onClick={goNext}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(200,162,77,0.12)", color: "#C8A24D" }}
                aria-label="Berikutnya"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="mb-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={goPrevThumbPage}
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(200,162,77,0.12)", color: "#C8A24D" }}
                  aria-label="Slide foto sebelumnya"
                >
                  <ChevronLeft size={18} />
                </button>

                <div
                  className="grid gap-3 flex-1"
                  style={{
                    gridTemplateColumns: `repeat(${thumbsPerPage}, minmax(0, 1fr))`,
                  }}
                >
                  {visibleThumbs.map((item, indexOnPage) => {
                    const realIndex = thumbStart + indexOnPage;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveIndex(realIndex)}
                        className="relative overflow-hidden rounded-lg border transition-all duration-200"
                        style={{
                          borderColor:
                            realIndex === safeActive
                              ? "rgba(200,162,77,0.8)"
                              : "rgba(200,162,77,0.25)",
                          opacity: realIndex === safeActive ? 1 : 0.55,
                        }}
                        aria-label={`Pilih ${item.name}`}
                      >
                        <img
                          src={item.photo}
                          alt={item.name}
                          className="w-full h-28 object-cover object-top"
                        />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={goNextThumbPage}
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(200,162,77,0.12)", color: "#C8A24D" }}
                  aria-label="Slide foto berikutnya"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <p
                className="text-xs mt-3 text-center"
                style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}
              >
                Slide {safeThumbPage + 1} dari {totalThumbPages}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={cardBaseStyle}>
                <h3
                  className="mb-4"
                  style={{ color: "#F5D06F", fontFamily: "var(--font-cinzel)", fontWeight: 700 }}
                >
                  Juara Versi Juri
                </h3>
                <div className="grid gap-3">
                  {juryRanking.map((entry, index) => {
                    const winner = entry.participant;
                    return (
                      <div
                        key={winner.id}
                        className="rounded-xl px-4 py-3 flex items-center gap-3"
                        style={{
                          background: "rgba(200,162,77,0.08)",
                          border: "1px solid rgba(200,162,77,0.25)",
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: "linear-gradient(135deg, #F5D06F, #C8A24D)",
                            color: "#0F0F0F",
                            fontFamily: "var(--font-cinzel)",
                          }}
                        >
                          {index + 1}
                        </div>
                        <img
                          src={winner.photo}
                          alt={winner.name}
                          className="w-11 h-11 rounded-lg object-cover object-top border"
                          style={{ borderColor: "rgba(200,162,77,0.35)" }}
                        />
                        <div className="min-w-0">
                          <p
                            className="truncate text-sm"
                            style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)", fontWeight: 600 }}
                          >
                            {winner.name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "#C8A24D", fontFamily: "var(--font-poppins)" }}
                          >
                            {winner.number} • Peringkat pilihan juri
                          </p>
                          <a
                            href={`https://instagram.com/${winner.instagram.replace("@", "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs underline"
                            style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}
                          >
                            {winner.instagram}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl p-5" style={cardBaseStyle}>
                <h3
                  className="mb-4"
                  style={{ color: "#F5D06F", fontFamily: "var(--font-cinzel)", fontWeight: 700 }}
                >
                  Vote Terbanyak
                </h3>
                <div className="grid gap-3">
                  {voteRanking.map((winner, index) => (
                    <div
                      key={`vote-${winner.id}`}
                      className="rounded-xl px-4 py-3 flex items-center gap-3"
                      style={{
                        background: "rgba(200,162,77,0.08)",
                        border: "1px solid rgba(200,162,77,0.25)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: "linear-gradient(135deg, #F5D06F, #C8A24D)",
                          color: "#0F0F0F",
                          fontFamily: "var(--font-cinzel)",
                        }}
                      >
                        {index + 1}
                      </div>
                      <img
                        src={winner.photo}
                        alt={winner.name}
                        className="w-11 h-11 rounded-lg object-cover object-top border"
                        style={{ borderColor: "rgba(200,162,77,0.35)" }}
                      />
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm"
                          style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)", fontWeight: 600 }}
                        >
                          {winner.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "#C8A24D", fontFamily: "var(--font-poppins)" }}
                        >
                          {winner.number} • {(winner.likes ?? 0).toLocaleString("id-ID")} vote
                        </p>
                        <a
                          href={`https://instagram.com/${winner.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs underline"
                          style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}
                        >
                          {winner.instagram}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Link
                    href="/vote"
                    className="text-sm"
                    style={{ color: "#C8A24D", fontFamily: "var(--font-poppins)" }}
                  >
                    Lihat semua finalis di halaman Vote
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}


