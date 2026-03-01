"use client";

import React, { useState } from "react";
import NextImage from "next/image";
import { Upload, CheckCircle, AlertCircle, FileText, Image as ImageIcon } from "lucide-react";
import { useApp } from "../../../../context/AppContext";
import GoldCard from "../../../../components/dashboard/GoldCard";

type UploadFileInfo = {
  name: string;
  size: string;
  preview?: string;
};

type DocumentItem = {
  key: string;
  label: string;
  required: boolean;
  accept: string;
  maxSize: string;
  description: string;
  icon: React.ReactNode;
};

const requiredDocuments: DocumentItem[] = [
  {
    key: "identityCard",
    label: "KTP / Kartu Pelajar",
    required: true,
    accept: "image/*,.pdf",
    maxSize: "2 MB",
    description: "Foto/scan KTP atau Kartu Pelajar yang masih berlaku",
    icon: <FileText size={20} />,
  },
  {
    key: "closeUpPhoto",
    label: "Foto Close Up",
    required: true,
    accept: "image/*",
    maxSize: "5 MB",
    description: "Foto wajah terbaru, latar putih/polos, berkualitas tinggi",
    icon: <ImageIcon size={20} />,
  },
  {
    key: "fullBodyPhoto",
    label: "Foto Full Body",
    required: true,
    accept: "image/*",
    maxSize: "5 MB",
    description: "Foto badan penuh terbaru, pakaian formal/adat, latar polos",
    icon: <ImageIcon size={20} />,
  },
  {
    key: "formS01",
    label: "Formulir S-01",
    required: true,
    accept: "image/*,.pdf",
    maxSize: "2 MB",
    description: "Formulir pendaftaran yang telah diisi dan ditandatangani",
    icon: <FileText size={20} />,
  },
  {
    key: "formS02",
    label: "Formulir S-02",
    required: true,
    accept: "image/*,.pdf",
    maxSize: "2 MB",
    description: "Surat pernyataan peserta bermaterai 10.000",
    icon: <FileText size={20} />,
  },
  {
    key: "formS03",
    label: "Formulir S-03",
    required: true,
    accept: "image/*,.pdf",
    maxSize: "2 MB",
    description: "Surat keterangan sehat dari dokter/puskesmas",
    icon: <FileText size={20} />,
  },
  {
    key: "formS04",
    label: "Formulir S-04",
    required: true,
    accept: "image/*,.pdf",
    maxSize: "2 MB",
    description: "Surat keterangan domisili Kota Batam",
    icon: <FileText size={20} />,
  },
];

const optionalDocuments: DocumentItem[] = [
  {
    key: "certificate",
    label: "Sertifikat / Piagam Prestasi",
    required: false,
    accept: "image/*,.pdf",
    maxSize: "10 MB",
    description: "Sertifikat atau piagam prestasi relevan (boleh lebih dari 1)",
    icon: <FileText size={20} />,
  },
];

export default function ParticipantDocumentsPage() {
  const { currentParticipant, participantList } = useApp();
  const participant = currentParticipant ?? participantList[0] ?? null;

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadFileInfo | null>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const inferredDoneFromProfile = (key: string) => {
    switch (key) {
      case "identityCard":
        return Boolean(participant?.nationalId);
      case "closeUpPhoto":
      case "fullBodyPhoto":
        return Boolean(participant?.photo);
      default:
        return false;
    }
  };

  const isDone = (key: string) => Boolean(uploadedFiles[key]) || inferredDoneFromProfile(key);

  const handleFileChange = async (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingKey(key);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setUploadingKey(null);

    const sizeInKb = file.size / 1024;
    const formattedSize = sizeInKb >= 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${Math.round(sizeInKb)} KB`;

    let previewUrl: string | undefined;
    if (file.type.startsWith("image/")) {
      previewUrl = URL.createObjectURL(file);
    }

    setUploadedFiles((prev) => ({
      ...prev,
      [key]: { name: file.name, size: formattedSize, preview: previewUrl },
    }));
  };

  const totalRequired = requiredDocuments.length;
  const completedRequired = requiredDocuments.filter((doc) => isDone(doc.key)).length;
  const uploadProgress = Math.round((completedRequired / totalRequired) * 100);

  const renderDocumentCard = (item: DocumentItem) => {
    const done = isDone(item.key);
    const uploading = uploadingKey === item.key;
    const uploaded = uploadedFiles[item.key];

    return (
      <div
        key={item.key}
        className="rounded-2xl p-5"
        style={{
          background: "#1A1A1A",
          border: `1px solid ${
            done ? "rgba(34,197,94,0.35)" : item.required ? "rgba(239,68,68,0.25)" : "rgba(212,175,55,0.2)"
          }`,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: done ? "rgba(34,197,94,0.15)" : item.required ? "rgba(239,68,68,0.1)" : "rgba(212,175,55,0.1)",
              color: done ? "#22c55e" : item.required ? "#ef4444" : "#D4AF37",
            }}
          >
            {done ? <CheckCircle size={20} /> : item.required ? <AlertCircle size={20} /> : item.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="text-sm font-semibold" style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}>
                {item.label}
              </h4>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: item.required ? "rgba(239,68,68,0.1)" : "rgba(212,175,55,0.1)",
                  color: item.required ? "#ef4444" : "#D4AF37",
                  fontFamily: "var(--font-poppins)",
                }}
              >
                {item.required ? "Wajib" : "Opsional"}
              </span>
            </div>

            <p className="text-xs mb-2" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
              {item.description}
            </p>
            <p className="text-xs" style={{ color: "#666", fontFamily: "var(--font-poppins)" }}>
              Format: {item.accept} | Maks: {item.maxSize}
            </p>

            {done && uploaded ? (
              <div className="mt-3 flex items-center gap-3">
                {uploaded.preview ? (
                  <NextImage
                    src={uploaded.preview}
                    alt="Preview dokumen"
                    width={40}
                    height={40}
                    unoptimized
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : null}
                <div>
                  <p
                    className="text-xs font-medium truncate max-w-48"
                    style={{ color: "#22c55e", fontFamily: "var(--font-poppins)" }}
                  >
                    {uploaded.name}
                  </p>
                  <p className="text-xs" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
                    {uploaded.size}
                  </p>
                </div>
              </div>
            ) : null}

            {done && !uploaded ? (
              <div className="mt-2 flex items-center gap-2">
                <CheckCircle size={12} style={{ color: "#22c55e" }} />
                <span className="text-xs" style={{ color: "#22c55e", fontFamily: "var(--font-poppins)" }}>
                  Berkas sudah terupload
                </span>
              </div>
            ) : null}
          </div>

          <div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept={item.accept}
                className="hidden"
                onChange={(event) => handleFileChange(item.key, event)}
                disabled={uploading}
              />
              <div
                className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
                style={{
                  background: done
                    ? "rgba(34,197,94,0.1)"
                    : "linear-gradient(135deg, rgba(245,208,111,0.15), rgba(212,175,55,0.15))",
                  border: done ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(212,175,55,0.3)",
                  color: done ? "#22c55e" : "#D4AF37",
                  fontFamily: "var(--font-poppins)",
                  cursor: uploading ? "not-allowed" : "pointer",
                }}
              >
                {uploading ? (
                  <>
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    Upload...
                  </>
                ) : done ? (
                  <>
                    <CheckCircle size={12} />
                    Re-upload
                  </>
                ) : (
                  <>
                    <Upload size={12} />
                    Upload
                  </>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1
            style={{ fontFamily: "var(--font-cinzel)", color: "#D4AF37", fontSize: "1.5rem", fontWeight: 700 }}
          >
            Upload Berkas Persyaratan
          </h1>
          <p className="text-sm mt-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
            Upload semua berkas persyaratan dengan format yang benar
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs mb-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
            Berkas Wajib
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: completedRequired === totalRequired ? "#22c55e" : "#D4AF37", fontFamily: "var(--font-cinzel)" }}
          >
            {completedRequired}/{totalRequired}
          </p>
        </div>
      </div>

      <GoldCard className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold" style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}>
            Progress Upload Berkas Wajib
          </span>
          <span className="text-sm" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
            {uploadProgress}%
          </span>
        </div>
        <div className="h-3 rounded-full" style={{ background: "#2A2A2A" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${uploadProgress}%`,
              background:
                completedRequired === totalRequired
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : "linear-gradient(90deg, #F5D06F, #D4AF37)",
            }}
          />
        </div>
        {completedRequired === totalRequired ? (
          <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "#22c55e", fontFamily: "var(--font-poppins)" }}>
            <CheckCircle size={12} />
            Semua berkas wajib telah lengkap! Menunggu verifikasi admin.
          </p>
        ) : null}
      </GoldCard>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} style={{ color: "#ef4444" }} />
          <h2 className="text-sm font-bold" style={{ color: "#F5E6C8", fontFamily: "var(--font-cinzel)" }}>
            BERKAS WAJIB
          </h2>
        </div>
        <div className="space-y-3">{requiredDocuments.map((item) => renderDocumentCard(item))}</div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} style={{ color: "#D4AF37" }} />
          <h2 className="text-sm font-bold" style={{ color: "#F5E6C8", fontFamily: "var(--font-cinzel)" }}>
            BERKAS OPSIONAL
          </h2>
        </div>
        <div className="space-y-3">{optionalDocuments.map((item) => renderDocumentCard(item))}</div>
      </div>
    </div>
  );
}
