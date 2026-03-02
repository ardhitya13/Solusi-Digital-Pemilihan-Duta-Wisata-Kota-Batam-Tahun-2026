"use client";

import React from "react";
import { Trophy, Target, Users, Star } from "lucide-react";
import { winnerCategories } from "../../../data/mockData";

const generalRequirements = [
  "Warga Negara Indonesia dan berdomisili di Kota Batam",
  "Berusia 18 – 25 tahun pada saat pendaftaran",
  "Belum menikah",
  "Pendidikan minimal SMA/SMK/sederajat",
  "Tinggi badan minimal: Pria 175 cm, Wanita 165 cm",
  "Sehat jasmani dan rohani",
];

const specialRequirements = [
  "Memiliki akun Instagram aktif dan tidak di-private",
  "Bersedia mengikuti seluruh tahapan seleksi",
  "Tidak sedang menjabat sebagai Duta aktif",
  "Mampu berkomunikasi dalam Bahasa Indonesia dan Bahasa Inggris",
  "Memiliki wawasan luas tentang pariwisata Kota Batam",
  "Bersedia mempromosikan pariwisata Kota Batam selama masa jabatan",
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center mb-16">
          <p
            className="text-sm tracking-widest uppercase mb-3"
            style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}
          >
            Tentang Program
          </p>

          <h2
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
            ENCIK &amp; PUAN DUTA WISATA BATAM
          </h2>

          <div
            className="w-24 h-0.5 mx-auto mt-4"
            style={{
              background: "linear-gradient(90deg, transparent, #D4AF37, transparent)",
            }}
          />
        </div>

        {/* TENTANG + VISI MISI */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Tentang */}
          <div className="rounded-2xl p-8 bg-[#1A1A1A] border border-yellow-700/30">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-linear-to-br from-[#F5D06F] to-[#D4AF37]">
                <Users size={18} color="#0F0F0F" />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}
              >
                Tentang Program
              </h3>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              <strong className="text-yellow-400">
                Encik &amp; Puan Duta Wisata Kota Batam
              </strong>{" "}
              adalah program tahunan yang diselenggarakan oleh Dinas Kebudayaan dan
              Pariwisata Kota Batam untuk menjaring generasi muda terbaik sebagai
              representasi dan promotor pariwisata Batam.
            </p>
          </div>

          {/* Visi Misi */}
          <div className="rounded-2xl p-8 bg-[#1A1A1A] border border-yellow-700/30">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-linear-to-br from-[#F5D06F] to-[#D4AF37]">
                <Target size={18} color="#0F0F0F" />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}
              >
                Visi &amp; Misi
              </h3>
            </div>

            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <Star
                  size={14}
                  className="mt-1"
                  style={{ color: "#D4AF37" }}
                  fill="#D4AF37"
                />
                Mewujudkan generasi muda Batam sebagai duta pariwisata yang unggul,
                berkarakter, dan berdaya saing.
              </li>
              <li className="flex items-start gap-2">
                <Star
                  size={14}
                  className="mt-1"
                  style={{ color: "#D4AF37" }}
                  fill="#D4AF37"
                />
                Mempromosikan destinasi wisata Batam ke tingkat nasional dan
                internasional.
              </li>
            </ul>
          </div>
        </div>

        {/* KATEGORI PEMENANG */}
        <div className="mb-16">
          <div className="text-center mb-10 flex justify-center items-center gap-3">
            <Trophy size={20} style={{ color: "#D4AF37" }} />
            <h3
              className="text-xl font-bold"
              style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}
            >
              KATEGORI PEMENANG
            </h3>
            <Trophy size={20} style={{ color: "#D4AF37" }} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {winnerCategories.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="rounded-xl p-5 text-center bg-[#1A1A1A] border border-yellow-700/20"
              >
                <div className="mb-3 w-8 h-8 mx-auto rounded-full flex items-center justify-center bg-linear-to-br from-[#F5D06F] to-[#8C6A1C] text-black font-bold text-xs">
                  {index + 1}
                </div>

                <h4
                  className="text-sm font-semibold mb-2"
                  style={{ color: "#F5D06F", fontFamily: "var(--font-cinzel)" }}
                >
                  {item.title}
                </h4>

                <p className="text-xs text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PERSYARATAN */}
        <div className="grid lg:grid-cols-2 gap-8">
          {[
            { title: "PERSYARATAN UMUM", items: generalRequirements },
            { title: "PERSYARATAN KHUSUS", items: specialRequirements },
          ].map((block) => (
            <div
              key={block.title}
              className="rounded-2xl p-8 bg-[#1A1A1A] border border-yellow-700/30"
            >
              <h3 className="text-lg font-semibold text-yellow-500 mb-5">
                ✦ {block.title}
              </h3>

              <ul className="space-y-3 text-sm text-gray-400">
                {block.items.map((text, i) => (
                  <li key={`${block.title}-${i}`} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-yellow-500/20 text-yellow-400">
                      {i + 1}
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

