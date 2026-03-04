"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit, Mail } from "lucide-react";
import GoldCard from "../../../../components/dashboard/GoldCard";
import { GoldButton } from "../../../../components/ui/GoldButton";
import { useApp } from "../../../../context/AppContext";
import { stages, type Judge } from "../../../../data/mockData";

type JudgeFormState = {
  name: string;
  title: string;
  organization: string;
  email: string;
  stages: string[];
};

const emptyForm: JudgeFormState = {
  name: "",
  title: "",
  organization: "",
  email: "",
  stages: [],
};

export default function AdminJudgesPage() {
  const { judgeList } = useApp();
  const [localJudgeList, setLocalJudgeList] = useState<Judge[]>(judgeList);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<JudgeFormState>(emptyForm);

  const handleStageToggle = (stage: string) => {
    setForm((prev) => ({
      ...prev,
      stages: prev.stages.includes(stage)
        ? prev.stages.filter((item) => item !== stage)
        : [...prev.stages, stage],
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.title.trim()) return;

    if (editId) {
      setLocalJudgeList((prev) =>
        prev.map((judge) =>
          judge.id === editId
            ? {
                ...judge,
                name: form.name.trim(),
                title: form.title.trim(),
                organization: form.organization.trim(),
                email: form.email.trim() || undefined,
                stages: form.stages,
              }
            : judge
        )
      );
    } else {
      setLocalJudgeList((prev) => [
        ...prev,
        {
          id: `J${Date.now()}`,
          name: form.name.trim(),
          title: form.title.trim(),
          organization: form.organization.trim(),
          email: form.email.trim() || undefined,
          stages: form.stages,
          avatar: "https://images.unsplash.com/photo-1648448942225-7aa06c7e8f79?w=100&q=80",
        },
      ]);
    }

    resetForm();
  };

  const handleEdit = (judge: Judge) => {
    setEditId(judge.id);
    setForm({
      name: judge.name,
      title: judge.title,
      organization: judge.organization,
      email: judge.email ?? "",
      stages: judge.stages,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setLocalJudgeList((prev) => prev.filter((judge) => judge.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-cinzel)",
              color: "#D4AF37",
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            Data Juri
          </h1>
          <p className="text-sm mt-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
            Kelola dewan juri per tahapan seleksi
          </p>
        </div>

        <GoldButton
          variant="primary"
          size="sm"
          onClick={() => {
            if (showForm && !editId) {
              resetForm();
              return;
            }
            setEditId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
        >
          <Plus size={14} />
          Tambah Juri
        </GoldButton>
      </div>

      {showForm ? (
        <GoldCard glow className="mb-6">
          <h3 className="text-sm font-bold mb-5" style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}>
            {editId ? "Edit Juri" : "Tambah Juri Baru"}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {[
              { label: "Nama Lengkap", key: "name", placeholder: "Dr. Nama Juri, M.Par" },
              { label: "Jabatan/Gelar", key: "title", placeholder: "Akademisi Pariwisata" },
              { label: "Institusi/Organisasi", key: "organization", placeholder: "Universitas Batam" },
              { label: "Email", key: "email", placeholder: "juri@email.com" },
            ].map((field) => (
              <div key={field.key}>
                <label
                  className="block text-xs mb-1.5"
                  style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}
                >
                  {field.label}
                </label>
                <input
                  type="text"
                  value={form[field.key as keyof JudgeFormState] as string}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.key]: event.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: "#111",
                    border: "1px solid rgba(212,175,55,0.25)",
                    color: "#F5E6C8",
                    fontFamily: "var(--font-poppins)",
                  }}
                  onFocus={(event) => (event.target.style.borderColor = "rgba(212,175,55,0.6)")}
                  onBlur={(event) => (event.target.style.borderColor = "rgba(212,175,55,0.25)")}
                />
              </div>
            ))}
          </div>

          <div className="mb-5">
            <label
              className="block text-xs mb-2"
              style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}
            >
              Ditugaskan pada Tahap:
            </label>
            <div className="flex flex-wrap gap-2">
              {stages.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => handleStageToggle(stage)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: form.stages.includes(stage) ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${form.stages.includes(stage) ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}`,
                    color: form.stages.includes(stage) ? "#D4AF37" : "#888",
                    fontFamily: "var(--font-cinzel)",
                    cursor: "pointer",
                  }}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <GoldButton variant="primary" size="sm" onClick={handleSave}>
              Simpan
            </GoldButton>
            <GoldButton variant="outline" size="sm" onClick={resetForm}>
              Batal
            </GoldButton>
          </div>
        </GoldCard>
      ) : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {localJudgeList.map((judge) => (
          <GoldCard key={judge.id}>
            <div className="flex items-start gap-4">
              <Image
                src={judge.avatar}
                alt={judge.name}
                width={56}
                height={56}
                unoptimized
                className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                style={{ border: "2px solid rgba(212,175,55,0.3)" }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold mb-1" style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}>
                  {judge.name}
                </h4>
                <p className="text-xs mb-1" style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)" }}>
                  {judge.title}
                </p>
                <p className="text-xs mb-2" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
                  {judge.organization}
                </p>

                {judge.email ? (
                  <div className="flex items-center gap-1 mb-2">
                    <Mail size={10} style={{ color: "#888" }} />
                    <p className="text-xs truncate" style={{ color: "#666", fontFamily: "var(--font-poppins)" }}>
                      {judge.email}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-1">
                  {judge.stages.map((stage) => (
                    <span
                      key={stage}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(212,175,55,0.12)",
                        color: "#D4AF37",
                        fontFamily: "var(--font-poppins)",
                        fontSize: "10px",
                      }}
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: "1px solid rgba(212,175,55,0.1)" }}>
              <button
                onClick={() => handleEdit(judge)}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs transition-all"
                style={{
                  background: "rgba(212,175,55,0.1)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  color: "#D4AF37",
                  fontFamily: "var(--font-poppins)",
                  cursor: "pointer",
                }}
                type="button"
              >
                <Edit size={12} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(judge.id)}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs transition-all"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#ef4444",
                  fontFamily: "var(--font-poppins)",
                  cursor: "pointer",
                }}
                type="button"
              >
                <Trash2 size={12} />
                Hapus
              </button>
            </div>
          </GoldCard>
        ))}
      </div>
    </div>
  );
}
