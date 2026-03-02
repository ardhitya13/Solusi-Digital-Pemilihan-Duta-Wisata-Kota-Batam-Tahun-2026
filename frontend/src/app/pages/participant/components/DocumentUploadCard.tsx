"use client";

import React from "react";
import Link from "next/link";
import NextImage from "next/image";
import { AlertCircle, CheckCircle, FileText, Image as ImageIcon, Upload } from "lucide-react";
import type { DocumentItem, UploadFileInfo } from "./documentUploadConfig";

type DocumentUploadCardProps = {
  item: DocumentItem;
  done: boolean;
  uploading: boolean;
  uploaded?: UploadFileInfo | null;
  onFileChange: (key: string, event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function DocumentUploadCard({
  item,
  done,
  uploading,
  uploaded,
  onFileChange,
}: DocumentUploadCardProps) {
  // Ikon menyesuaikan tipe dokumen (file umum atau image).
  const icon = item.icon === "image" ? <ImageIcon size={20} /> : <FileText size={20} />;

  return (
    <div
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
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: done ? "rgba(34,197,94,0.15)" : item.required ? "rgba(239,68,68,0.1)" : "rgba(212,175,55,0.1)",
            color: done ? "#22c55e" : item.required ? "#ef4444" : "#D4AF37",
          }}
        >
          {done ? <CheckCircle size={20} /> : item.required ? <AlertCircle size={20} /> : icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Informasi utama dokumen: nama, deskripsi, format, dan template unduh */}
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

          {item.templatePath ? (
            <Link
              href={item.templatePath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs underline"
              style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)" }}
            >
              <FileText size={12} /> {item.templateLabel ?? "Unduh template"}
            </Link>
          ) : null}

          {/* Preview file yang baru diupload pada sesi saat ini */}
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
                <p className="text-xs font-medium truncate max-w-48" style={{ color: "#22c55e", fontFamily: "var(--font-poppins)" }}>
                  {uploaded.name}
                </p>
                <p className="text-xs" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
                  {uploaded.size}
                </p>
              </div>
            </div>
          ) : null}

          {/* Kondisi sudah pernah terupload (dari data yang sudah tersimpan) */}
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
          {/* Tombol upload/re-upload dokumen */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept={item.accept}
              className="hidden"
              onChange={(event) => onFileChange(item.key, event)}
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
}
