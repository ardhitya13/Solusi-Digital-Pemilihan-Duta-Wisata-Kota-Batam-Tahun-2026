"use client";

import React, { useMemo, useRef, useState } from "react";
import NextImage from "next/image";
import { Download, FileText } from "lucide-react";
import { useApp } from "../../../../context/AppContext";
import { GoldButton } from "../../../../components/ui/GoldButton";
import GoldCard from "../../../../components/dashboard/GoldCard";
import type { StageStatus } from "../../../../data/mockData";

const statusLabel: Record<StageStatus, string> = {
  Pending: "Menunggu Verifikasi",
  Verified: "Lolos Administrasi",
  Rejected: "Ditolak",
  Audition: "Audition",
  Top20: "Top 20",
  PreCamp: "Pra-Karantina",
  Camp: "Karantina",
  GrandFinal: "Grand Final",
  Winner: "Pemenang",
};

export default function ExportPDFPage() {
  // Ambil data peserta aktif dan state proses cetak PDF.
  const { currentParticipant, participantList, user } = useApp();
  const [printing, setPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const participant = currentParticipant ?? participantList[0] ?? null;

  // Ringkasan berkas untuk ditampilkan di surat PDF.
  const berkasWajib = useMemo(
    () => [
      { label: "KTP", done: Boolean(participant?.nationalId) },
      { label: "Foto Close Up", done: Boolean(participant?.photo) },
      { label: "Foto Full Body", done: Boolean(participant?.photo) },
      { label: "Formulir S-01", done: Boolean(participant?.education) },
      { label: "Formulir S-02", done: Boolean(participant?.instagram) },
      { label: "Formulir S-03", done: Boolean(participant?.phone) },
      { label: "Formulir S-04", done: Boolean(participant?.birthDate && participant?.birthPlace) },
    ],
    [participant]
  );

  const doneCount = berkasWajib.filter((b) => b.done).length;

  // Normalisasi teks pendidikan agar lebih rapi di output PDF.
  const educationDisplay = useMemo(() => {
    const raw = participant?.education?.trim();
    if (!raw) return "-";
    const parts = raw.split(" - ").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2 && parts[parts.length - 1] === parts[parts.length - 2]) {
      parts.pop();
    }
    return parts.join(" - ");
  }, [participant?.education]);

  // Tanggal cetak dipakai satu kali saat render.
  const printedDate = useMemo(
    () =>
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    []
  );

  // Trigger print browser untuk generate PDF.
  const handlePrint = async () => {
    if (!printRef.current) return;
    setPrinting(true);
    await new Promise((r) => setTimeout(r, 350));
    window.print();
    setPrinting(false);
  };

  return (
    <div className="w-full">
      {/* Header halaman export */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 style={{ fontFamily: "var(--font-cinzel)", color: "#C8A24D", fontSize: "1.5rem", fontWeight: 700 }}>
            Export PDF Biodata
          </h1>
          <p className="text-sm mt-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
            Generate dan unduh PDF biodata pendaftaran Anda
          </p>
        </div>
        <GoldButton variant="primary" onClick={handlePrint} disabled={printing || !participant}>
          <Download size={16} />
          {printing ? "Memproses..." : "Download PDF"}
        </GoldButton>
      </div>

      {/* Card info format dokumen PDF */}
      <GoldCard className="mb-6">
        <div className="flex items-start gap-3">
          <FileText size={16} style={{ color: "#C8A24D", marginTop: 1 }} />
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#C8A24D", fontFamily: "var(--font-cinzel)" }}>
              Format PDF Biodata
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
              PDF biodata berisi informasi lengkap peserta termasuk foto, data diri, status berkas, dan status seleksi.
              File ini dapat digunakan untuk keperluan filter administrasi oleh panitia.
            </p>
          </div>
        </div>
      </GoldCard>

      {/* Area konten yang akan dicetak menjadi PDF */}
      <div ref={printRef}>
        <div
          className="rounded-2xl overflow-hidden print:shadow-none"
          style={{
            background: "#0F0F0F",
            border: "1px solid rgba(200,162,77,0.4)",
            boxShadow: "0 0 40px rgba(200,162,77,0.1)",
          }}
        >
          {/* Header surat */}
          <div
            className="p-6"
            style={{
              background: "linear-gradient(135deg, #1A1A1A, #0F0F0F)",
              borderBottom: "2px solid rgba(200,162,77,0.4)",
            }}
          >
            <div className="flex items-center gap-4">
              <NextImage
                src="/logo.png"
                alt="Logo"
                width={56}
                height={56}
                className="w-14 h-14 object-contain"
                style={{ filter: "drop-shadow(0 0 10px rgba(200,162,77,0.5))" }}
              />
              <div>
                <h2 style={{ fontFamily: "var(--font-cinzel)", color: "#C8A24D", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.1em" }}>
                  PEMILIHAN DUTA WISATA KOTA BATAM
                </h2>
                <p style={{ fontFamily: "var(--font-cinzel)", color: "#F5D06F", fontSize: "0.75rem", letterSpacing: "0.12em" }}>
                  ENCIK & PUAN - 2026
                </p>
                <p style={{ fontFamily: "var(--font-poppins)", color: "#888", fontSize: "0.65rem" }}>
                  Dinas Kebudayaan dan Pariwisata Kota Batam
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
                  Nomor Peserta
                </p>
                <p style={{ fontFamily: "var(--font-cinzel)", color: "#C8A24D", fontSize: "1.1rem", fontWeight: 700 }}>
                  {participant?.number || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Isi utama surat */}
          <div className="p-6">
            <div className="grid sm:grid-cols-3 gap-6 mb-6">
              <div className="flex justify-center">
                <div className="relative">
                  <NextImage
                    src={participant?.photo || "/logo.png"}
                    alt="Foto Peserta"
                    width={128}
                    height={160}
                    unoptimized
                    className="w-32 h-40 object-cover rounded-xl"
                    style={{ border: "3px solid rgba(200,162,77,0.5)" }}
                  />
                  <div
                    className="absolute -bottom-3 -right-3 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "#1A1A1A", border: "2px solid rgba(200,162,77,0.4)" }}
                  >
                    <div className="grid grid-cols-3 gap-0.5">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{ background: [0, 2, 4, 6, 8].includes(i) ? "#C8A24D" : "#333" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <h3 style={{ fontFamily: "var(--font-cinzel)", color: "#F5E6C8", fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>
                  {participant?.name || user?.name || "Nama Peserta"}
                </h3>

                <div className="space-y-2">
                  {[
                    { label: "Kategori", value: participant?.gender === "Encik" ? "ENCIK (Putra)" : "PUAN (Putri)" },
                    { label: "NIK", value: participant?.nationalId || "-" },
                    {
                      label: "TTL",
                      value: participant?.birthDate ? `${participant?.birthPlace || "-"}, ${participant.birthDate}` : "-",
                    },
                    { label: "Tinggi Badan", value: participant?.heightCm ? `${participant.heightCm} cm` : "-" },
                    { label: "Pendidikan", value: educationDisplay },
                    { label: "Instagram", value: participant?.instagram || "-" },
                    { label: "Email", value: participant?.email || user?.email || "-" },
                  ].map((d) => (
                    <div key={d.label} className="flex gap-3 text-xs">
                      <span style={{ color: "#888", fontFamily: "var(--font-poppins)", minWidth: 90 }}>{d.label}</span>
                      <span style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}>: {d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status checklist dokumen */}
            <div className="mb-5">
              <p className="text-xs font-bold mb-3" style={{ color: "#C8A24D", fontFamily: "var(--font-cinzel)" }}>
                STATUS BERKAS ({doneCount}/{berkasWajib.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {berkasWajib.map((b) => (
                  <span
                    key={b.label}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: b.done ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.1)",
                      border: `1px solid ${b.done ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.3)"}`,
                      color: b.done ? "#22c55e" : "#ef4444",
                      fontFamily: "var(--font-poppins)",
                    }}
                  >
                    {b.done ? "✓" : "✗"} {b.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Ringkasan status seleksi saat ini */}
            <div
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: "rgba(200,162,77,0.08)", border: "1px solid rgba(200,162,77,0.25)" }}
            >
              <div>
                <p className="text-xs" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
                  Status Seleksi Saat Ini
                </p>
                <p className="text-sm font-bold" style={{ color: "#C8A24D", fontFamily: "var(--font-cinzel)" }}>
                  {participant ? statusLabel[participant.status] : "Menunggu Verifikasi"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
                  Dicetak pada
                </p>
                <p className="text-xs" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
                  {printedDate}
                </p>
              </div>
            </div>
          </div>

          {/* Footer surat */}
          <div
            className="px-6 py-4"
            style={{ borderTop: "1px solid rgba(200,162,77,0.2)", background: "rgba(200,162,77,0.03)" }}
          >
            <p className="text-xs text-center" style={{ color: "#555", fontFamily: "var(--font-poppins)" }}>
              Dokumen ini digenerate secara otomatis oleh Sistem Pemilihan Duta Wisata Kota Batam 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

