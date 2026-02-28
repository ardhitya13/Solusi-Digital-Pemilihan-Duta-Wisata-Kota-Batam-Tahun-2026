"use client";

import React from "react";
import { Instagram, Star, Crown } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { GoldButton } from "../../../components/ui/GoldButton";

export default function VoteSection() {
  const { participantList } = useApp();
  const finalists = participantList.filter(
    (p) => p.status === "GrandFinal" || p.status === "Winner"
  );

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p
            className="text-sm tracking-widest uppercase mb-3"
            style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}
          >
            Grand Final
          </p>

          <h1
            style={{
              fontFamily: "var(--font-cinzel)",
              background: "linear-gradient(135deg, #F5D06F, #D4AF37)",
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
                "linear-gradient(90deg, transparent, #D4AF37, transparent)",
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
            background: "rgba(212,175,55,0.08)",
            border: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <Star
            size={16}
            fill="#D4AF37"
            style={{ color: "#D4AF37", marginTop: 2, flexShrink: 0 }}
          />
          <p
            className="text-xs leading-relaxed"
            style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}
          >
            Voting dilakukan melalui Instagram. Klik tombol{" "}
            <strong style={{ color: "#D4AF37" }}>
              &quot;Vote via Instagram&quot;
            </strong>{" "}
            untuk membuka profil finalis dan berikan dukungan Anda.
          </p>
        </div>

        {finalists.length === 0 ? (
          <div className="text-center py-16">
            <Crown
              size={48}
              style={{ color: "#D4AF37", margin: "0 auto 16px", opacity: 0.5 }}
            />
            <p style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
              Finalis Grand Final belum diumumkan.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {finalists.map((participant) => {
              const number = participant.number.includes("-")
                ? participant.number.split("-")[1]
                : participant.number;
              const genderLabel = participant.gender === "Encik" ? "ENCIK" : "PUAN";
              const genderBg =
                participant.gender === "Encik"
                  ? "rgba(34,117,196,0.65)"
                  : "rgba(183,61,131,0.65)";
              const igHandle = participant.instagram.replace("@", "");

              return (
                <div
                  key={participant.id}
                  className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "#1A1A1A",
                    border: "1px solid rgba(212,175,55,0.3)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="relative overflow-hidden h-[260px]">
                    <img
                      src={participant.photo}
                      alt={participant.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
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
                        background: "linear-gradient(135deg, #F5D06F, #D4AF37)",
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
                        {participant.name}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{
                          color: "#D4AF37",
                          fontFamily: "var(--font-poppins)",
                        }}
                      >
                        {participant.number}
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
                      {participant.education.split(" - ")[0].trim()}
                    </p>
                    <p
                      className="text-xs mb-4 truncate"
                      style={{
                        color: "#D4AF37",
                        fontFamily: "var(--font-poppins)",
                      }}
                    >
                      <Instagram size={11} className="inline mr-1" />
                      {participant.instagram}
                    </p>

                    <GoldButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() =>
                        window.open(`https://instagram.com/${igHandle}`, "_blank")
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

