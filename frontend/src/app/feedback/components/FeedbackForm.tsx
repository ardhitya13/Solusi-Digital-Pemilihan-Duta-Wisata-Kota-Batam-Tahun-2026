"use client";

import React, { useState } from "react";
import { GoldButton } from "../../../components/ui/GoldButton";

type FormState = {
  name: string;
  email: string;
  category: "Saran" | "Kritik" | "Pertanyaan" | "Lainnya";
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  category: "Saran",
  message: "",
};

export default function FeedbackForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const onChange =
    (key: keyof FormState) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setForm(initialState);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl p-6 sm:p-8"
      style={{
        background: "#1A1A1A",
        border: "1px solid rgba(212,175,55,0.25)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            className="text-xs block mb-2"
            style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)" }}
          >
            Nama
          </label>
          <input
            required
            value={form.name}
            onChange={onChange("name")}
            className="w-full rounded-xl px-4 py-3 outline-none"
            style={{
              background: "#111111",
              border: "1px solid rgba(212,175,55,0.2)",
              color: "#F5E6C8",
              fontFamily: "var(--font-poppins)",
            }}
          />
        </div>

        <div>
          <label
            className="text-xs block mb-2"
            style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)" }}
          >
            Email
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={onChange("email")}
            className="w-full rounded-xl px-4 py-3 outline-none"
            style={{
              background: "#111111",
              border: "1px solid rgba(212,175,55,0.2)",
              color: "#F5E6C8",
              fontFamily: "var(--font-poppins)",
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        <label
          className="text-xs block mb-2"
          style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)" }}
        >
          Kategori
        </label>
        <select
          value={form.category}
          onChange={onChange("category")}
          className="w-full rounded-xl px-4 py-3 outline-none"
          style={{
            background: "#111111",
            border: "1px solid rgba(212,175,55,0.2)",
            color: "#F5E6C8",
            fontFamily: "var(--font-poppins)",
          }}
        >
          <option value="Saran">Saran</option>
          <option value="Kritik">Kritik</option>
          <option value="Pertanyaan">Pertanyaan</option>
          <option value="Lainnya">Lainnya</option>
        </select>
      </div>

      <div className="mt-4">
        <label
          className="text-xs block mb-2"
          style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)" }}
        >
          Pesan
        </label>
        <textarea
          required
          rows={6}
          value={form.message}
          onChange={onChange("message")}
          className="w-full rounded-xl px-4 py-3 outline-none resize-y"
          style={{
            background: "#111111",
            border: "1px solid rgba(212,175,55,0.2)",
            color: "#F5E6C8",
            fontFamily: "var(--font-poppins)",
          }}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p
          className="text-xs"
          style={{ color: submitted ? "#D4AF37" : "#8F8F8F", fontFamily: "var(--font-poppins)" }}
        >
          {submitted ? "Terima kasih, feedback Anda sudah diterima." : "Feedback akan ditinjau oleh panitia."}
        </p>

        <GoldButton type="submit" variant="primary" size="sm">
          Kirim Feedback
        </GoldButton>
      </div>
    </form>
  );
}
