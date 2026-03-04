"use client";

import React from "react";
import Image from "next/image";
import { Instagram, Star, Crown } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { GoldButton } from "../../../components/ui/GoldButton";

export default function VoteSection() {
  const { voteCandidateList } = useApp();
  const finalists = voteCandidateList.filter((item) => item.enabled);

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p
            className="text-sm tracking-widest uppercase mb-3"
            style={{ color: "#C8A24D", fontFamily: "var(--font-cinzel)" }}
          >
            Grand Final
          </p>

          <h1
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
            VOTE FINALIS
          </h1>

          <div
            className="w-24 h-0.5 mx-auto mt-4 mb-6"
            style={{
              background:
                "linear-gradient(90deg, transparent, #C8A24D, transparent)",
            }}
          />

          <p
            className="max-w-xl mx-auto text-sm"
            style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}
          >
            Dukung finalis favorit Anda. Klik{" "}
            <strong style={{ color: "#F5D06F" }}>Vote via Instagram</strong>{" "}
            untuk mengunjungi akun Instagram finalis.
          </p>
        </div>

        <div
          className="max-w-2xl mx-auto mb-12 rounded-xl p-4 flex items-start gap-3"
          style={{
            background: "rgba(200,162,77,0.08)",
            border: "1px solid rgba(200,162,77,0.2)",
          }}
        >
          <Star
            size={16}
            fill="#C8A24D"
            style={{ color: "#C8A24D", marginTop: 2, flexShrink: 0 }}
          />
          <p
            className="text-xs leading-relaxed"
            style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}
          >
            Voting dilakukan melalui Instagram. Klik tombol{" "}
            <strong style={{ color: "#C8A24D" }}>
              &quot;Vote via Instagram&quot;
            </strong>{" "}
            untuk membuka profil finalis dan berikan dukungan Anda.
          </p>
        </div>

        {finalists.length === 0 ? (
          <div className="text-center py-16">
            <Crown
              size={48}
              style={{ color: "#C8A24D", margin: "0 auto 16px", opacity: 0.5 }}
            />
            <p style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
              Finalis Grand Final belum diumumkan.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {finalists.map((candidate) => {
              const number = candidate.number.includes("-")
                ? candidate.number.split("-")[1]
                : candidate.number;
              const genderLabel = candidate.gender === "Encik" ? "ENCIK" : "PUAN";
              const genderBg =
                candidate.gender === "Encik"
                  ? "rgba(34,117,196,0.65)"
                  : "rgba(183,61,131,0.65)";
              const igHandle = candidate.instagramHandle.replace("@", "");
              const instagramTarget = candidate.instagramProfileUrl || `https://instagram.com/${igHandle}`;

              return (
                <div
                  key={candidate.id}
                  className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "#1A1A1A",
                    border: "1px solid rgba(200,162,77,0.3)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="relative overflow-hidden h-[260px]">
                    <Image
                      src={candidate.photo}
                      alt={candidate.name}
                      fill
                      unoptimized
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />

                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(0deg, rgba(26,26,26,0.9) 0%, rgba(26,26,26,0.2) 50%, transparent 100%)",
                      }}
                    />

                    <div
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: "linear-gradient(135deg, #F5D06F, #C8A24D)",
                        color: "#0F0F0F",
                        fontFamily: "var(--font-cinzel)",
                      }}
                    >
                      {number}
                    </div>

                    <span
                      className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full"
                      style={{
                        background: genderBg,
                        color: "#fff",
                        fontFamily: "var(--font-cinzel)",
                        fontWeight: 600,
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {genderLabel}
                    </span>

                    <div className="absolute bottom-4 left-4 right-4">
                      <p
                        className="text-sm font-bold leading-tight"
                        style={{
                          color: "#F5E6C8",
                          fontFamily: "var(--font-cinzel)",
                        }}
                      >
                        {candidate.name}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{
                          color: "#C8A24D",
                          fontFamily: "var(--font-poppins)",
                        }}
                      >
                        {candidate.number}
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <p
                      className="text-xs mb-1 truncate"
                      style={{
                        color: "#BDBDBD",
                        fontFamily: "var(--font-poppins)",
                      }}
                    >
                      {candidate.education.split(" - ")[0].trim()}
                    </p>
                    <p
                      className="text-xs mb-4 truncate"
                      style={{
                        color: "#C8A24D",
                        fontFamily: "var(--font-poppins)",
                      }}
                    >
                      <Instagram size={11} className="inline mr-1" />
                      {candidate.instagramHandle || "-"}
                    </p>

                    <GoldButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() =>
                        window.open(instagramTarget, "_blank")
                      }
                    >
                      <Instagram size={14} />
                      Vote via Instagram
                    </GoldButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}


