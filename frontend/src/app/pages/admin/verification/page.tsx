"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle, XCircle, Clock, FileText, Eye } from "lucide-react";
import GoldCard from "../../../../components/dashboard/GoldCard";
import { GoldButton } from "../../../../components/ui/GoldButton";
import { useApp } from "../../../../context/AppContext";
import type { Participant, StageStatus } from "../../../../data/mockData";

type VerificationStatus = "Pending" | "Verified" | "Rejected";

type VerificationTab = {
  label: string;
  key: VerificationStatus;
  count: number;
  color: string;
  list: Participant[];
};

const requiredDocumentLabels = [
  "KTP",
  "Close Up",
  "Full Body",
  "Form S-01",
  "Form S-02",
  "Form S-03",
  "Form S-04",
];

function toVerificationStatus(status: StageStatus): VerificationStatus {
  if (status === "Pending") return "Pending";
  if (status === "Rejected") return "Rejected";
  return "Verified";
}

function getStatusBadge(status: VerificationStatus) {
  if (status === "Pending") {
    return {
      label: "Menunggu",
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.15)",
      icon: <Clock size={12} />,
    };
  }
  if (status === "Verified") {
    return {
      label: "Terverifikasi",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.15)",
      icon: <CheckCircle size={12} />,
    };
  }
  return {
    label: "Ditolak",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.15)",
    icon: <XCircle size={12} />,
  };
}

export default function AdminVerificationPage() {
  const { participantList, setParticipantList, currentParticipant, setCurrentParticipant } = useApp();
  const [activeTab, setActiveTab] = useState<VerificationStatus>("Pending");
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [rejectionReasonById, setRejectionReasonById] = useState<Record<string, string>>({});
  const [openRejectInputId, setOpenRejectInputId] = useState<string | null>(null);

  const statuses = useMemo<Record<string, VerificationStatus>>(() => {
    const initialStatusMap: Record<string, VerificationStatus> = {};
    participantList.forEach((participant) => {
      initialStatusMap[participant.id] = toVerificationStatus(participant.status);
    });
    return initialStatusMap;
  }, [participantList]);

  const pendingList = participantList.filter((participant) => statuses[participant.id] === "Pending");
  const verifiedList = participantList.filter((participant) => statuses[participant.id] === "Verified");
  const rejectedList = participantList.filter((participant) => statuses[participant.id] === "Rejected");

  const tabs: VerificationTab[] = [
    {
      label: "Menunggu",
      key: "Pending",
      count: pendingList.length,
      color: "#F59E0B",
      list: pendingList,
    },
    {
      label: "Terverifikasi",
      key: "Verified",
      count: verifiedList.length,
      color: "#22c55e",
      list: verifiedList,
    },
    {
      label: "Ditolak",
      key: "Rejected",
      count: rejectedList.length,
      color: "#ef4444",
      list: rejectedList,
    },
  ];

  const activeList = tabs.find((tab) => tab.key === activeTab)?.list ?? [];
  const selectedParticipant =
    participantList.find((participant) => participant.id === selectedParticipantId) ?? null;

  const updateParticipantStatus = (participantId: string, nextStatus: StageStatus, reason?: string) => {
    setParticipantList((prev) =>
      prev.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              status: nextStatus,
              rejectionReason: nextStatus === "Rejected" ? (reason?.trim() || "Berkas belum memenuhi ketentuan.") : undefined,
            }
          : participant
      )
    );

    if (currentParticipant?.id === participantId) {
      setCurrentParticipant((prev) =>
        prev
          ? {
              ...prev,
              status: nextStatus,
              rejectionReason: nextStatus === "Rejected" ? (reason?.trim() || "Berkas belum memenuhi ketentuan.") : undefined,
            }
          : prev
      );
    }
  };

  const handleVerify = (participantId: string) => {
    updateParticipantStatus(participantId, "Verified");
    setOpenRejectInputId(null);
  };

  const handleReject = (participantId: string) => {
    const reason = rejectionReasonById[participantId] ?? "";
    updateParticipantStatus(participantId, "Rejected", reason);
    setOpenRejectInputId(null);
  };

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
          Verifikasi Berkas
        </h1>
        <p className="text-sm mt-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
          Periksa dan verifikasi kelengkapan berkas peserta
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="rounded-2xl p-4 text-center transition-all duration-200"
            style={{
              background: activeTab === tab.key ? `${tab.color}15` : "#1A1A1A",
              border: `1px solid ${activeTab === tab.key ? tab.color : "rgba(212,175,55,0.2)"}`,
              cursor: "pointer",
            }}
            type="button"
          >
            <p className="text-2xl font-bold mb-1" style={{ color: tab.color, fontFamily: "var(--font-cinzel)" }}>
              {tab.count}
            </p>
            <p className="text-xs" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
              {tab.label}
            </p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {activeList.length === 0 ? (
          <GoldCard className="text-center py-12">
            <CheckCircle size={32} style={{ color: "#444", margin: "0 auto 12px" }} />
            <p style={{ color: "#666", fontFamily: "var(--font-poppins)" }}>
              Tidak ada peserta dalam kategori ini
            </p>
          </GoldCard>
        ) : (
          activeList.map((participant) => {
            const status = statuses[participant.id];
            const badge = getStatusBadge(status);
            const isSelected = selectedParticipantId === participant.id;

            return (
              <GoldCard key={participant.id}>
                <div className="flex items-center gap-4 flex-wrap">
                  <Image
                    src={participant.photo}
                    alt={participant.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    style={{ border: "1px solid rgba(212,175,55,0.3)" }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold" style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}>
                        {participant.name}
                      </h4>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: participant.gender === "Encik" ? "rgba(59,130,246,0.15)" : "rgba(236,72,153,0.15)",
                          color: participant.gender === "Encik" ? "#60a5fa" : "#f472b6",
                          fontFamily: "var(--font-cinzel)",
                        }}
                      >
                        {participant.gender}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
                      {participant.number} • {participant.education} • Daftar: {participant.registeredAt}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {requiredDocumentLabels.map((label) => (
                        <span
                          key={label}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(34,197,94,0.1)",
                            color: "#22c55e",
                            fontFamily: "var(--font-poppins)",
                            border: "1px solid rgba(34,197,94,0.2)",
                          }}
                        >
                          ✓ {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full"
                      style={{ background: badge.bg, color: badge.color, fontFamily: "var(--font-poppins)" }}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedParticipantId((prev) => (prev === participant.id ? null : participant.id))
                      }
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs"
                      style={{
                        background: "rgba(59,130,246,0.12)",
                        border: "1px solid rgba(59,130,246,0.25)",
                        color: "#60a5fa",
                        fontFamily: "var(--font-poppins)",
                        cursor: "pointer",
                      }}
                      type="button"
                    >
                      <Eye size={12} />
                      {isSelected ? "Tutup" : "Lihat"}
                    </button>
                  </div>

                  {status === "Pending" ? (
                    <div className="flex gap-2">
                      <GoldButton variant="primary" size="sm" onClick={() => handleVerify(participant.id)}>
                        <CheckCircle size={14} />
                        Loloskan
                      </GoldButton>
                      <button
                        onClick={() =>
                          setOpenRejectInputId((prev) => (prev === participant.id ? null : participant.id))
                        }
                        className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          color: "#ef4444",
                          fontFamily: "var(--font-poppins)",
                          cursor: "pointer",
                        }}
                        type="button"
                      >
                        <XCircle size={14} className="inline mr-1" />
                        Tolak
                      </button>
                    </div>
                  ) : null}
                </div>

                {isSelected ? (
                  <div
                    className="mt-4 pt-4 rounded-xl p-4"
                    style={{
                      borderTop: "1px solid rgba(212,175,55,0.15)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} style={{ color: "#D4AF37" }} />
                      <p className="text-xs font-semibold" style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)" }}>
                        Ringkasan Data Peserta
                      </p>
                    </div>
                    <p className="text-xs" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
                      Email: {participant.email}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
                      Telepon: {participant.phone}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
                      Status saat ini: {status === "Pending" ? "Menunggu Verifikasi" : status === "Verified" ? "Terverifikasi" : "Ditolak"}
                    </p>
                  </div>
                ) : null}

                {openRejectInputId === participant.id ? (
                  <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(239,68,68,0.15)" }}>
                    <label className="block text-xs mb-2" style={{ color: "#ef4444", fontFamily: "var(--font-poppins)" }}>
                      Alasan Penolakan:
                    </label>
                    <input
                      type="text"
                      value={rejectionReasonById[participant.id] ?? ""}
                      onChange={(event) =>
                        setRejectionReasonById((prev) => ({
                          ...prev,
                          [participant.id]: event.target.value,
                        }))
                      }
                      placeholder="Masukkan alasan penolakan..."
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-3"
                      style={{
                        background: "#111",
                        border: "1px solid rgba(239,68,68,0.3)",
                        color: "#F5E6C8",
                        fontFamily: "var(--font-poppins)",
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(participant.id)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold"
                        style={{
                          background: "rgba(239,68,68,0.15)",
                          border: "1px solid rgba(239,68,68,0.4)",
                          color: "#ef4444",
                          fontFamily: "var(--font-poppins)",
                          cursor: "pointer",
                        }}
                        type="button"
                      >
                        Konfirmasi Tolak
                      </button>
                      <button
                        onClick={() => setOpenRejectInputId(null)}
                        className="px-4 py-2 rounded-xl text-xs"
                        style={{
                          background: "transparent",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#888",
                          fontFamily: "var(--font-poppins)",
                          cursor: "pointer",
                        }}
                        type="button"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : null}
              </GoldCard>
            );
          })
        )}
      </div>

      {selectedParticipant?.status === "Rejected" && selectedParticipant.rejectionReason ? (
        <div className="mt-4">
          <GoldCard>
            <p className="text-xs" style={{ color: "#ef4444", fontFamily: "var(--font-poppins)" }}>
              Alasan penolakan terakhir: {selectedParticipant.rejectionReason}
            </p>
          </GoldCard>
        </div>
      ) : null}
    </div>
  );
}
