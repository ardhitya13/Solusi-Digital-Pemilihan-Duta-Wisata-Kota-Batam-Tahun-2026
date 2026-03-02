"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  FileText,
  Clock,
  AlertCircle,
  Star,
  TrendingUp,
  Upload,
  CheckCircle,
} from "lucide-react";
import { useApp } from "../../../../context/AppContext";
import { statusLabelsId } from "../../../../data/mockData";
import GoldCard from "../../../../components/dashboard/GoldCard";
import { GoldButton } from "../../../../components/ui/GoldButton";

function toPercent(filled: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((filled / total) * 100);
}

function getStageIndex(status: string): number {
  const order = ["Verified", "Audition", "PreCamp", "Camp", "GrandFinal", "Winner"];
  return order.findIndex((s) => s === status);
}

export default function ParticipantDashboardPage() {
  // Router dan context utama peserta.
  const router = useRouter();
  const { user, currentParticipant, participantList, setCurrentParticipant, setParticipantList } = useApp();
  const [submitInfo, setSubmitInfo] = useState("");
  const [submitInfoType, setSubmitInfoType] = useState<"success" | "error">("error");

  // Peserta aktif, fallback ke data pertama untuk mode demo.
  const participant = currentParticipant ?? participantList[0] ?? null;

  // Mapping tampilan status seleksi ke warna/icon.
  const statusConfig = useMemo(
    () => ({
      Pending: { color: "#BDBDBD", bg: "rgba(189,189,189,0.1)", icon: <Clock size={14} /> },
      Verified: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: <CheckCircle size={14} /> },
      Rejected: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: <AlertCircle size={14} /> },
      Audition: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: <Star size={14} /> },
      Top20: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: <Star size={14} /> },
      PreCamp: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: <Star size={14} /> },
      Camp: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: <Star size={14} /> },
      GrandFinal: {
        color: "#D4AF37",
        bg: "rgba(212,175,55,0.1)",
        icon: <Star size={14} fill="#D4AF37" />,
      },
      Winner: {
        color: "#D4AF37",
        bg: "rgba(212,175,55,0.1)",
        icon: <Star size={14} fill="#D4AF37" />,
      },
    }),
    []
  );

  // Ringkasan dokumen untuk progress dashboard.
  const requiredDocuments = participant
    ? [
        { label: "KTP / NIK", done: Boolean(participant.nationalId) },
        { label: "Foto Profil", done: Boolean(participant.photo) },
        { label: "Data Pendidikan", done: Boolean(participant.education) },
        { label: "Kontak Telepon", done: Boolean(participant.phone) },
        { label: "Instagram", done: Boolean(participant.instagram) },
        { label: "Data Kelahiran", done: Boolean(participant.birthDate && participant.birthPlace) },
      ]
    : [];

  const completedDocuments = requiredDocuments.filter((d) => d.done).length;
  const documentProgress = toPercent(completedDocuments, requiredDocuments.length);

  // Ringkasan field biodata untuk progress dashboard.
  const profileFields = participant
    ? [
        participant.name,
        participant.nationalId,
        participant.birthPlace,
        participant.birthDate,
        participant.heightCm ? String(participant.heightCm) : "",
        participant.education,
        participant.instagram,
        participant.phone,
        participant.email,
        participant.agreementNoAgency ?? "",
        participant.agreementParentPermission ?? "",
        participant.agreementAllStages ?? "",
        participant.motivationStatement ?? "",
        participant.contributionIdea ?? "",
        participant.publicSpeakingExperience ?? "",
      ]
    : [];

  // Kalkulasi progress dan syarat submit ke admin.
  const filledProfile = profileFields.filter((v) => Boolean(v)).length;
  const profileProgress = toPercent(filledProfile, profileFields.length);
  const overallProgress = Math.round((profileProgress + documentProgress) / 2);
  const alreadySubmitted = Boolean(participant?.submittedToAdmin);
  const canSubmitToAdmin =
    Boolean(participant) && profileProgress === 100 && documentProgress === 100 && !alreadySubmitted;

  const statusValue = participant?.status ?? "Pending";
  const statusInfo = statusConfig[statusValue];
  const stageIndex = getStageIndex(statusValue);

  // Tahapan utama proses seleksi.
  const stages = [
    { label: "Administrasi", index: 0 },
    { label: "Audisi", index: 1 },
    { label: "Pra-Karantina", index: 2 },
    { label: "Karantina", index: 3 },
    { label: "Grand Final", index: 4 },
    { label: "Juara", index: 5 },
  ];

  // Toast submit admin akan hilang otomatis.
  useEffect(() => {
    if (!submitInfo) return;
    const timer = window.setTimeout(() => setSubmitInfo(""), 3000);
    return () => window.clearTimeout(timer);
  }, [submitInfo]);

  // Kirim data peserta ke admin jika semua syarat lengkap.
  const handleSubmitToAdmin = () => {
    if (alreadySubmitted) {
      setSubmitInfoType("success");
      setSubmitInfo("Anda sudah mengirim data Anda. Mohon tunggu verifikasi admin.");
      return;
    }

    if (!participant || !canSubmitToAdmin) {
      setSubmitInfoType("error");
      setSubmitInfo("Lengkapi biodata dan dokumen sampai 100% sebelum kirim ke admin.");
      return;
    }

    const updatedParticipant = {
      ...participant,
      status: "Pending" as const,
      submittedToAdmin: true,
    };

    setCurrentParticipant(updatedParticipant);
    setParticipantList((prev) =>
      prev.map((item) => (item.id === updatedParticipant.id ? updatedParticipant : item))
    );
    setSubmitInfoType("success");
    setSubmitInfo("Data berhasil dikirim ke admin. Silakan tunggu proses verifikasi.");
  };

  return (
    <>
      <div className="mb-8">
        {/* Header halaman dashboard peserta */}
        <h1
          style={{
            fontFamily: "var(--font-cinzel)",
            color: "#D4AF37",
            fontSize: "1.5rem",
            fontWeight: 700,
          }}
        >
          Dashboard Peserta
        </h1>
        <p className="text-sm mt-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
          Selamat datang, <strong style={{ color: "#F5E6C8" }}>{user?.name ?? "Peserta"}</strong>!
        </p>
      </div>

      {participant && statusInfo ? (
        <div
          className="rounded-2xl p-5 mb-6 flex items-center justify-between flex-wrap gap-3"
          style={{ background: statusInfo.bg, border: `1px solid ${statusInfo.color}40` }}
        >
          <div className="flex items-center gap-3">
            <span style={{ color: statusInfo.color }}>{statusInfo.icon}</span>
            <div>
              <p className="text-xs" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
                Status Seleksi
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: statusInfo.color, fontFamily: "var(--font-cinzel)" }}
              >
                {statusLabelsId[participant.status]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
                No. Peserta
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}
              >
                {participant.number}
              </p>
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs capitalize font-semibold"
              style={{
                background: "rgba(212,175,55,0.15)",
                color: "#D4AF37",
                fontFamily: "var(--font-cinzel)",
              }}
            >
              {participant.gender === "Encik" ? "ENCIK" : "PUAN"}
            </div>
          </div>
        </div>
      ) : null}

      {/* Banner khusus jika peserta berstatus ditolak */}
      {participant?.status === "Rejected" ? (
        <div
          className="mb-6 rounded-xl p-3"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.35)",
          }}
        >
          <p className="text-sm" style={{ color: "#ef4444", fontFamily: "var(--font-poppins)" }}>
            Alasan penolakan: {participant.rejectionReason ?? "Berkas atau data belum memenuhi ketentuan panitia. Silakan perbaiki dan kirim ulang sesuai arahan admin."}
          </p>
        </div>
      ) : null}

      {/* Kartu statistik ringkas progress peserta */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Kelengkapan Biodata",
            value: `${profileProgress}%`,
            icon: <User size={18} />,
            color: "#3b82f6",
          },
          {
            label: "Upload Berkas",
            value: `${completedDocuments}/${requiredDocuments.length}`,
            icon: <FileText size={18} />,
            color: "#22c55e",
          },
          {
            label: "Progress Overall",
            value: `${overallProgress}%`,
            icon: <TrendingUp size={18} />,
            color: "#D4AF37",
          },
          {
            label: "Tahap Seleksi",
            value: statusLabelsId[statusValue as keyof typeof statusLabelsId] ?? "-",
            icon: <Star size={18} />,
            color: "#8b5cf6",
          },
        ].map((stat, index) => (
          <GoldCard key={index} className="text-center">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: `${stat.color}20`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <p className="text-base lg:text-xl font-bold mb-1" style={{ color: "#F5E6C8", fontFamily: "var(--font-cinzel)" }}>
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
              {stat.label}
            </p>
          </GoldCard>
        ))}
      </div>

      {/* Kolom progress pendaftaran + timeline seleksi */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <GoldCard glow>
          <h3 className="text-sm font-bold mb-5" style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}>
            Kelengkapan Pendaftaran
          </h3>

          {[
            {
              label: "Biodata",
              progress: profileProgress,
              bar: "linear-gradient(90deg, #F5D06F, #D4AF37)",
            },
            {
              label: "Upload Berkas Wajib",
              progress: documentProgress,
              bar: "linear-gradient(90deg, #22c55e, #16a34a)",
            },
            {
              label: "Keseluruhan",
              progress: overallProgress,
              bar: "linear-gradient(90deg, #F5D06F, #D4AF37, #8C6A1C)",
            },
          ].map((item, index) => (
            <div key={item.label} className={index < 2 ? "mb-4" : "mb-5"}>
              <div className="flex justify-between text-xs mb-2" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
                <span>{item.label}</span>
                <span>{item.progress}%</span>
              </div>
              <div className={index < 2 ? "h-2 rounded-full" : "h-3 rounded-full"} style={{ background: "#2A2A2A" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.progress}%`, background: item.bar }}
                />
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <GoldButton variant="primary" size="sm" onClick={() => router.push("/pages/participant/biodata")}>
              Isi Biodata
            </GoldButton>
            <GoldButton variant="outline" size="sm" onClick={() => router.push("/pages/participant/dokumen")}>
              Upload Berkas
            </GoldButton>
            <GoldButton variant="primary" size="sm" onClick={handleSubmitToAdmin} disabled={!canSubmitToAdmin}>
              Kirim Seleksi Admin
            </GoldButton>
          </div>
          {!canSubmitToAdmin && !alreadySubmitted ? (
            <p className="mt-2 text-xs" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
              Tombol aktif jika Biodata 100% dan Upload Berkas Wajib 100%.
            </p>
          ) : null}
          {alreadySubmitted ? (
            <p className="mt-2 text-xs" style={{ color: "#22c55e", fontFamily: "var(--font-poppins)" }}>
              Data sudah dikirim ke admin dan sedang menunggu verifikasi.
            </p>
          ) : null}
        </GoldCard>

        <GoldCard>
          <h3 className="text-sm font-bold mb-5" style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}>
            Alur Tahapan Seleksi
          </h3>
          <div className="space-y-3">
            {stages.map((stage, index) => {
              const state =
                participant?.status === "Rejected"
                  ? stage.index === 0
                    ? "failed"
                    : "pending"
                  : stage.index < stageIndex
                  ? "done"
                  : stage.index === stageIndex
                  ? "active"
                  : "pending";

              return (
                <div key={stage.label} className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background:
                        state === "done"
                          ? "rgba(34,197,94,0.2)"
                          : state === "active"
                          ? "rgba(212,175,55,0.2)"
                          : state === "failed"
                          ? "rgba(239,68,68,0.2)"
                          : "rgba(255,255,255,0.05)",
                      border: `1px solid ${
                        state === "done"
                          ? "rgba(34,197,94,0.4)"
                          : state === "active"
                          ? "rgba(212,175,55,0.4)"
                          : state === "failed"
                          ? "rgba(239,68,68,0.4)"
                          : "rgba(255,255,255,0.1)"
                      }`,
                      color:
                        state === "done"
                          ? "#22c55e"
                          : state === "active"
                          ? "#D4AF37"
                          : state === "failed"
                          ? "#ef4444"
                          : "#555",
                      fontFamily: "var(--font-cinzel)",
                    }}
                  >
                    {state === "done" ? "✓" : state === "failed" ? "✗" : index + 1}
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-sm"
                      style={{
                        color:
                          state === "done"
                            ? "#22c55e"
                            : state === "active"
                            ? "#D4AF37"
                            : state === "failed"
                            ? "#ef4444"
                            : "#666",
                        fontFamily: "var(--font-poppins)",
                        fontWeight: state === "active" ? 600 : 400,
                      }}
                    >
                      {stage.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </GoldCard>
      </div>

      {/* Checklist cepat status dokumen */}
      <GoldCard>
        <h3 className="text-sm font-bold mb-4" style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}>
          Status Upload Berkas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {requiredDocuments.map((doc) => (
            <div
              key={doc.label}
              className="rounded-xl p-3 text-center"
              style={{
                background: doc.done ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${doc.done ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.2)"}`,
              }}
            >
              <div className="text-base mb-1">{doc.done ? "✅" : "❌"}</div>
              <p className="text-xs" style={{ color: doc.done ? "#22c55e" : "#ef4444", fontFamily: "var(--font-poppins)" }}>
                {doc.label}
              </p>
            </div>
          ))}
        </div>
        {documentProgress < 100 ? (
          <div className="mt-4">
            <GoldButton variant="primary" size="sm" onClick={() => router.push("/pages/participant/dokumen")}>
              <Upload size={14} /> Lengkapi Berkas
            </GoldButton>
          </div>
        ) : null}
      </GoldCard>

      {/* Toast notifikasi aksi kirim seleksi admin */}
      {submitInfo ? (
        <div
          className="fixed bottom-5 right-5 z-50 rounded-xl px-4 py-3 shadow-lg"
          style={{
            background: "rgba(17,17,17,0.95)",
            border:
              submitInfoType === "success"
                ? "1px solid rgba(34,197,94,0.55)"
                : "1px solid rgba(239,68,68,0.55)",
            backdropFilter: "blur(8px)",
          }}
        >
          <p
            className="text-sm"
            style={{
              color: submitInfoType === "success" ? "#22c55e" : "#ef4444",
              fontFamily: "var(--font-poppins)",
            }}
          >
            {submitInfo}
          </p>
        </div>
      ) : null}
    </>
  );
}
