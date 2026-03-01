"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import NextImage from "next/image";
import { Save, CheckCircle, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "../../../../context/AppContext";
import GoldCard from "../../../../components/dashboard/GoldCard";
import { GoldButton } from "../../../../components/ui/GoldButton";

type FormState = {
  fullName: string;
  gender: "Encik" | "Puan";
  nationalId: string;
  birthPlace: string;
  birthDate: string;
  heightCm: string;
  educationInstitution: string;
  educationMajor: string;
  instagram: string;
  vision: string;
  mission: string;
  experience: string;
  achievement: string;
  introVideoUrl: string;
  profilePhoto: string;
  educationCategory: "SMA" | "SMK" | "MA" | "Kampus";
  educationDegree: string;
};

type EducationCategory = FormState["educationCategory"];

const inputStyle: React.CSSProperties = {
  background: "#111",
  border: "1px solid rgba(212,175,55,0.25)",
  color: "#F5E6C8",
  fontFamily: "var(--font-poppins)",
};

export default function BiodataPage() {
  const router = useRouter();
  const { currentParticipant, setCurrentParticipant, participantList, setParticipantList } = useApp();
  const participant = currentParticipant ?? participantList[0] ?? null;
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmittedToAdmin, setIsSubmittedToAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const institutionRef = useRef<HTMLDivElement | null>(null);
  const majorRef = useRef<HTMLDivElement | null>(null);

  const educationData = {
    SMA: {
      institutions: [
        "SMAN 3 Batam",
        "SMAN 1 Batam",
        "SMAN 10 Batam",
        "SMAN 11 Batam",
        "SMAN 12 Batam",
        "SMAN 13 Batam",
        "SMAN 14 Batam",
        "SMAN 15 Batam",
        "SMAN 16 Batam",
        "SMAN 17 Batam",
        "SMAN 18 Batam",
        "SMAN 19 Batam",
        "SMAN 2 Batam",
        "SMAN 20 Batam",
        "SMAN 21 Batam",
        "SMAN 22 Batam",
        "SMAN 23 Batam",
        "SMAN 24 Batam",
        "SMAN 25 Batam",
        "SMAN 26 Batam",
        "SMAN 27 Batam",
        "SMAN 28 Batam",
        "SMAN 3 Batam",
        "SMAN 4 Batam",
        "SMAN 5 Batam",
        "SMAN 6 Batam",
        "SMAN 7 Batam",
        "SMAN 8 Batam",
        "SMAN 9 Batam",
        "SMA Kartini Batam",
        "SMA Yos Sudarso Batam",
        "SMA Maitreyawira Batam",
      ],
      majors: ["IPA", "IPS", "Bahasa", "Keagamaan"],
    },
    SMK: {
      institutions: [
        "SMKN 1 Batam",
        "SMKN 2 Batam",
        "SMKN 3 Batam",
        "SMKN 4 Batam",
        "SMKN 5 Batam",
        "SMKN 6 Batam",
        "SMKN 7 Batam",
        "SMKN 8 Batam",
        "SMKN 9 Batam",
      ],
      majors: [
        "Teknik Komputer dan Jaringan",
        "Rekayasa Perangkat Lunak",
        "Multimedia",
        "Akuntansi",
        "Administrasi Perkantoran",
        "Perhotelan",
        "Usaha Perjalanan Wisata",
        "Teknik Mesin",
        "Teknik Elektro",
        "Tata Boga",
      ],
    },
    MA: {
      institutions: [
        "MAN 1 Kota Batam",
        "MAN 2 Kota Batam",
        "MAN Insan Cendekia Kota Batam",
        "MA YA HUSNAYA",
        "MA NAHDLATUL WATHAN",
        "MA MANBAUL HIDAYAH",
        "MA AMANATUL UMMAH",
        "MA ISKANDAR MUDA",
        "MA QUR`AN CENTRE",
        "MA BATAMIYAH",
        "MA AL MARHAMAH",
        "MA Al-Mukarramah",
        "MA DARUL IHSAN",
        "MA DARUL FALAH",
        "MA INDUSTRI ALJABAR",
        "MA AN NI`MAH",
        "MA PLUS NURUL HAQ",
      ],
      majors: ["MIPA", "IPS", "Bahasa", "Keagamaan", "Ilmu Keagamaan Islam"],
    },
    Kampus: {
      institutions: [
        "Politeknik Negeri Batam",
        "Universitas Batam",
        "Universitas Putera Batam",
        "Universitas Internasional Batam",
        "Universitas Riau Kepulauan (UNRIKA) Batam",
        "STIT Hidayatullah Batam",
      ],
      majors: [
        "Teknik Informatika",
        "Sistem Informasi",
        "Teknik Komputer",
        "Akuntansi",
        "Manajemen",
        "Ilmu Komunikasi",
        "Hukum",
        "Pariwisata",
        "Teknik Industri",
        "Bahasa Inggris",
      ],
      degrees: ["D3", "D4", "S1", "S2", "S3", "Profesi"],
    },
  } as const;

  const isEducationCategory = (value: string | undefined): value is EducationCategory =>
    value === "SMA" || value === "SMK" || value === "MA" || value === "Kampus";

  const parseEducation = (value: string | undefined) => {
    if (!value) return { institution: "", major: "" };
    const normalized = value.replace(" – ", " - ").replace(" | ", " - ");
    const parts = normalized.split(" - ");
    const rawCategory = parts[0]?.trim();
    return {
      institution: parts[1]?.trim() ?? parts[0]?.trim() ?? "",
      major: parts.slice(2).join(" - ").trim() || parts.slice(1).join(" - ").trim(),
      category: isEducationCategory(rawCategory) ? rawCategory : undefined,
    };
  };

  const parsedEducation = parseEducation(participant?.education);

  const [form, setForm] = useState<FormState>({
    fullName: participant?.name ?? "",
    gender: participant?.gender ?? "Encik",
    nationalId: participant?.nationalId ?? "",
    birthPlace: participant?.birthPlace ?? "",
    birthDate: participant?.birthDate ?? "",
    heightCm: participant?.heightCm ? String(participant.heightCm) : "",
    educationInstitution: parsedEducation.institution,
    educationMajor: parsedEducation.major,
    educationCategory: parsedEducation.category ?? "Kampus",
    educationDegree: "",
    instagram: participant?.instagram ?? "",
    vision: "",
    mission: "",
    experience: "",
    achievement: "",
    introVideoUrl: "",
    profilePhoto: participant?.photo ?? "",
  });

  const completionProgress = useMemo(() => {
    const requiredFields = [
      form.fullName,
      form.nationalId,
      form.birthPlace,
      form.birthDate,
      form.heightCm,
      form.educationInstitution,
      form.instagram,
      form.vision,
      form.mission,
      form.introVideoUrl,
    ];
    const filledCount = requiredFields.filter(Boolean).length;
    return Math.round((filledCount / requiredFields.length) * 100);
  }, [form]);

  const selectedEducation = educationData[form.educationCategory] ?? educationData.Kampus;
  const institutionOptions = selectedEducation.institutions;
  const majorOptions = selectedEducation.majors;
  const degreeOptions = form.educationCategory === "Kampus" ? educationData.Kampus.degrees : [];

  const institutionKeyword = form.educationInstitution.toLowerCase().trim();
  const filteredInstitutions = institutionKeyword
    ? institutionOptions.filter((item) => item.toLowerCase().includes(institutionKeyword))
    : institutionOptions;

  const majorKeyword = form.educationMajor.toLowerCase().trim();
  const filteredMajors = majorKeyword
    ? majorOptions.filter((item) => item.toLowerCase().includes(majorKeyword))
    : majorOptions;

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (institutionRef.current && !institutionRef.current.contains(target)) {
        setShowInstitutionDropdown(false);
      }
      if (majorRef.current && !majorRef.current.contains(target)) {
        setShowMajorDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const updateFormField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildEducationValue = () =>
    form.educationInstitution.trim()
      ? form.educationMajor.trim()
        ? form.educationCategory === "Kampus" && form.educationDegree.trim()
          ? `${form.educationCategory} - ${form.educationInstitution.trim()} - ${form.educationDegree.trim()} - ${form.educationMajor.trim()}`
          : `${form.educationCategory} - ${form.educationInstitution.trim()} - ${form.educationMajor.trim()}`
        : form.educationInstitution.trim()
      : "";

  const handleSaveDraft = (event: React.FormEvent) => {
    event.preventDefault();
    if (!participant) return;
    setErrorMessage("");
    setIsSubmittedToAdmin(false);

    const parsedHeight = Number(form.heightCm);
    const normalizedHeight =
      Number.isFinite(parsedHeight) && parsedHeight > 0 ? parsedHeight : participant.heightCm || 0;

    const educationValue = buildEducationValue();

    const updatedParticipant = {
      ...participant,
      name: form.fullName,
      gender: form.gender,
      nationalId: form.nationalId,
      birthPlace: form.birthPlace,
      birthDate: form.birthDate,
      heightCm: normalizedHeight,
      education: educationValue,
      instagram: form.instagram,
      photo: form.profilePhoto || participant.photo,
    };

    setCurrentParticipant(updatedParticipant);
    setParticipantList((prev) =>
      prev.map((item) => (item.id === updatedParticipant.id ? updatedParticipant : item))
    );

    setIsSaved(true);
    window.setTimeout(() => setIsSaved(false), 2800);
  };

  const handleSubmitToAdmin = () => {
    if (!participant) return;
    setErrorMessage("");
    setIsSaved(false);
    setIsSubmittedToAdmin(false);

    if (completionProgress < 100) {
      setErrorMessage("Lengkapi data hingga 100% sebelum kirim ke seleksi admin.");
      return;
    }

    const parsedHeight = Number(form.heightCm);
    const minimumHeight = form.gender === "Encik" ? 175 : 170;
    if (!Number.isFinite(parsedHeight) || parsedHeight < minimumHeight) {
      setErrorMessage(
        `Tinggi badan minimal untuk ${form.gender === "Encik" ? "Encik" : "Puan"} adalah ${minimumHeight} cm.`
      );
      return;
    }

    if (form.educationCategory === "Kampus" && !form.educationDegree.trim()) {
      setErrorMessage("Pilih jenjang pendidikan kampus (D3/D4/S1/S2/S3/Profesi).");
      return;
    }

    const introVideoUrl = form.introVideoUrl.trim();
    const isAllowedVideoUrl =
      introVideoUrl.includes("youtube.com") ||
      introVideoUrl.includes("youtu.be") ||
      introVideoUrl.includes("drive.google.com");
    if (!introVideoUrl || !isAllowedVideoUrl) {
      setErrorMessage("Link video harus diisi dan berasal dari YouTube atau Google Drive.");
      return;
    }

    const updatedParticipant = {
      ...participant,
      name: form.fullName,
      gender: form.gender,
      nationalId: form.nationalId,
      birthPlace: form.birthPlace,
      birthDate: form.birthDate,
      heightCm: parsedHeight,
      education: buildEducationValue(),
      instagram: form.instagram,
      photo: form.profilePhoto || participant.photo,
      status: "Pending" as const,
    };

    setCurrentParticipant(updatedParticipant);
    setParticipantList((prev) =>
      prev.map((item) => (item.id === updatedParticipant.id ? updatedParticipant : item))
    );

    setIsSubmittedToAdmin(true);
  };

  const renderInputField = ({
    label,
    name,
    type = "text",
    placeholder,
    required = false,
    hint,
  }: {
    label: string;
    name: keyof FormState;
    type?: string;
    placeholder?: string;
    required?: boolean;
    hint?: string;
  }) => (
    <div>
      <label
        className="block text-xs mb-1.5"
        style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}
      >
        {label} {required ? <span style={{ color: "#ef4444" }}>*</span> : null}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => updateFormField(name, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.6)")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.25)")}
      />
      {hint ? (
        <p className="text-xs mt-1" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );

  const renderTextAreaField = ({
    label,
    name,
    placeholder,
    required = false,
    rows = 4,
    hint,
  }: {
    label: string;
    name: keyof FormState;
    placeholder?: string;
    required?: boolean;
    rows?: number;
    hint?: string;
  }) => (
    <div>
      <label
        className="block text-xs mb-1.5"
        style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}
      >
        {label} {required ? <span style={{ color: "#ef4444" }}>*</span> : null}
      </label>
      <textarea
        value={form[name]}
        onChange={(e) => updateFormField(name, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.6)")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.25)")}
      />
      {hint ? (
        <p className="text-xs mt-1" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );

  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Foto profil harus berupa file gambar.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran foto profil maksimal 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateFormField("profilePhoto", String(reader.result ?? ""));
      setErrorMessage("");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1
            style={{ fontFamily: "var(--font-cinzel)", color: "#D4AF37", fontSize: "1.5rem", fontWeight: 700 }}
          >
            Data Diri dan Biodata
          </h1>
          <p className="text-sm mt-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
            Lengkapi biodata Anda dengan benar dan lengkap.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
              Kelengkapan
            </p>
            <p className="text-lg font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}>
              {completionProgress}%
            </p>
          </div>
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="3"
                strokeDasharray={`${completionProgress * 0.974} 100`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.5s ease" }}
              />
            </svg>
          </div>
        </div>
      </div>

      {isSaved ? (
        <div
          className="mb-6 p-4 rounded-xl flex items-center gap-3"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          <CheckCircle size={16} style={{ color: "#22c55e" }} />
          <p className="text-sm" style={{ color: "#22c55e", fontFamily: "var(--font-poppins)" }}>
            Biodata berhasil disimpan.
          </p>
        </div>
      ) : null}

      {errorMessage ? (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)" }}
        >
          <p className="text-sm" style={{ color: "#ef4444", fontFamily: "var(--font-poppins)" }}>
            {errorMessage}
          </p>
        </div>
      ) : null}

      {isSubmittedToAdmin ? (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          <p className="text-sm" style={{ color: "#22c55e", fontFamily: "var(--font-poppins)" }}>
            Data berhasil dikirim ke seleksi admin. Silakan pantau progres di menu Status Seleksi.
          </p>
        </div>
      ) : null}

      <form onSubmit={handleSaveDraft} className="space-y-6">
        <GoldCard glow>
          <h2
            className="text-sm font-bold mb-5 pb-3"
            style={{
              color: "#D4AF37",
              fontFamily: "var(--font-cinzel)",
              borderBottom: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            DATA PRIBADI
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label
                className="block text-xs mb-1.5"
                style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}
              >
                Foto Profil Peserta
              </label>
              <div
                className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: "#111", border: "1px solid rgba(212,175,55,0.25)" }}
              >
                <NextImage
                  src={form.profilePhoto || "/logo.png"}
                  alt="Preview foto profil"
                  width={64}
                  height={64}
                  unoptimized
                  className="w-16 h-16 rounded-xl object-cover"
                  style={{ border: "1px solid rgba(212,175,55,0.35)" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}>
                    Upload foto close-up formal untuk profil dashboard.
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
                    Format JPG/PNG, ukuran maksimal 5 MB.
                  </p>
                </div>
                <label
                  className="px-3 py-2 rounded-lg text-xs cursor-pointer inline-flex items-center gap-2"
                  style={{
                    background: "rgba(212,175,55,0.12)",
                    border: "1px solid rgba(212,175,55,0.28)",
                    color: "#D4AF37",
                    fontFamily: "var(--font-poppins)",
                  }}
                >
                  <Upload size={12} />
                  Ganti Foto
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoChange} />
                </label>
              </div>
            </div>
            {renderInputField({
              label: "Nama Lengkap",
              name: "fullName",
              placeholder: "Sesuai KTP/Akta Lahir",
              required: true,
            })}
            <div>
              <label
                className="block text-xs mb-1.5"
                style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}
              >
                Kategori <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={form.gender}
                onChange={(e) => updateFormField("gender", e.target.value as "Encik" | "Puan")}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={inputStyle}
                disabled={Boolean(participant)}
              >
                <option value="Encik">Encik (Pria)</option>
                <option value="Puan">Puan (Wanita)</option>
              </select>
              <p className="text-xs mt-1" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
                Kategori ditentukan saat register dan tidak dapat diubah di biodata.
              </p>
            </div>
            {renderInputField({ label: "NIK", name: "nationalId", placeholder: "16 digit NIK", required: true })}
            {renderInputField({ label: "Tempat Lahir", name: "birthPlace", placeholder: "Batam", required: true })}
            {renderInputField({ label: "Tanggal Lahir", name: "birthDate", type: "date", required: true })}
            {renderInputField({
              label: "Tinggi Badan (cm)",
              name: "heightCm",
              type: "number",
              placeholder: "Contoh: 170",
              required: true,
              hint: `Min. Encik: 175 cm | Min. Puan: 170 cm (${form.gender === "Encik" ? "saat ini Encik" : "saat ini Puan"})`,
            })}
            <div className="sm:col-span-2">
              <label
                className="block text-xs mb-1.5"
                style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}
              >
                Pendidikan Terakhir <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] mb-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
                    Kategori Pendidikan
                  </p>
                  <select
                    value={form.educationCategory}
                    onChange={(e) => {
                      const category = e.target.value as "SMA" | "SMK" | "MA" | "Kampus";
                      setForm((prev) => ({
                        ...prev,
                        educationCategory: category,
                        educationInstitution: "",
                        educationDegree: "",
                        educationMajor: "",
                      }));
                      setShowInstitutionDropdown(false);
                      setShowMajorDropdown(false);
                    }}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={inputStyle}
                  >
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                    <option value="MA">MA / MAN (Sekolah Agama)</option>
                    <option value="Kampus">Kampus</option>
                  </select>
                </div>
                <div className="relative" ref={institutionRef}>
                  <p className="text-[11px] mb-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
                    Instansi (Sekolah/Kampus)
                  </p>
                  <input
                    type="text"
                    value={form.educationInstitution}
                    onChange={(e) => {
                      updateFormField("educationInstitution", e.target.value);
                      setShowInstitutionDropdown(true);
                    }}
                    onFocus={(e) => {
                      setShowInstitutionDropdown(true);
                      e.target.style.borderColor = "rgba(212,175,55,0.6)";
                    }}
                    placeholder="Contoh: Politeknik Negeri Batam"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={inputStyle}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.25)")}
                  />
                  {showInstitutionDropdown ? (
                    <div
                      className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-30"
                      style={{
                        background: "#141414",
                        border: "1px solid rgba(212,175,55,0.25)",
                        maxHeight: 220,
                        overflowY: "auto",
                      }}
                    >
                      {filteredInstitutions.length > 0 ? (
                        filteredInstitutions.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              updateFormField("educationInstitution", item);
                              setShowInstitutionDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[#1f1f1f]"
                            style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}
                          >
                            {item}
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-xs" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
                          Tidak ada hasil, tetap bisa ketik bebas.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
                {form.educationCategory === "Kampus" ? (
                  <div>
                    <p className="text-[11px] mb-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
                      Jenjang
                    </p>
                    <select
                      value={form.educationDegree}
                      onChange={(e) => updateFormField("educationDegree", e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      style={inputStyle}
                    >
                      <option value="">Pilih jenjang</option>
                      {degreeOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <div
                  className={`relative ${form.educationCategory === "Kampus" ? "" : "sm:col-span-2"}`}
                  ref={majorRef}
                >
                  <p className="text-[11px] mb-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
                    Jurusan
                  </p>
                  <input
                    type="text"
                    value={form.educationMajor}
                    onChange={(e) => {
                      updateFormField("educationMajor", e.target.value);
                      setShowMajorDropdown(true);
                    }}
                    onFocus={(e) => {
                      setShowMajorDropdown(true);
                      e.target.style.borderColor = "rgba(212,175,55,0.6)";
                    }}
                    placeholder="Contoh: Teknik Informatika"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={inputStyle}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.25)")}
                  />
                  {showMajorDropdown ? (
                    <div
                      className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-30"
                      style={{
                        background: "#141414",
                        border: "1px solid rgba(212,175,55,0.25)",
                        maxHeight: 220,
                        overflowY: "auto",
                      }}
                    >
                      {filteredMajors.length > 0 ? (
                        filteredMajors.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              updateFormField("educationMajor", item);
                              setShowMajorDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[#1f1f1f]"
                            style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}
                          >
                            {item}
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-xs" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
                          Tidak ada hasil, tetap bisa ketik bebas.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
              <p className="text-xs mt-1" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
                Pilih dari list atau ketik bebas untuk instansi dan jurusan.
              </p>
            </div>
          </div>
        </GoldCard>

        <GoldCard>
          <h2
            className="text-sm font-bold mb-5 pb-3"
            style={{
              color: "#D4AF37",
              fontFamily: "var(--font-cinzel)",
              borderBottom: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            MEDIA SOSIAL
          </h2>
          {renderInputField({
            label: "Username Instagram",
            name: "instagram",
            placeholder: "@username (akun harus public)",
            required: true,
            hint: "Akun Instagram wajib tidak di-private sesuai ketentuan.",
          })}
        </GoldCard>

        <GoldCard>
          <h2
            className="text-sm font-bold mb-5 pb-3"
            style={{
              color: "#D4AF37",
              fontFamily: "var(--font-cinzel)",
              borderBottom: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            VISI, MISI, DAN PENGALAMAN
          </h2>
          <div className="space-y-4">
            {renderTextAreaField({
              label: "Visi",
              name: "vision",
              placeholder: "Tuliskan visi Anda sebagai Duta Wisata Kota Batam...",
              required: true,
              rows: 3,
            })}
            {renderTextAreaField({
              label: "Misi",
              name: "mission",
              placeholder: "Tuliskan misi-misi konkret yang akan Anda laksanakan...",
              required: true,
              rows: 4,
            })}
            {renderTextAreaField({
              label: "Pengalaman Organisasi dan Kepemudaan",
              name: "experience",
              placeholder: "Sebutkan pengalaman organisasi atau kegiatan pariwisata...",
              rows: 4,
            })}
          </div>
        </GoldCard>

        <GoldCard>
          <h2
            className="text-sm font-bold mb-5 pb-3"
            style={{
              color: "#D4AF37",
              fontFamily: "var(--font-cinzel)",
              borderBottom: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            INFORMASI TAMBAHAN (OPSIONAL)
          </h2>
          <div className="space-y-4">
            {renderTextAreaField({
              label: "Prestasi dan Penghargaan",
              name: "achievement",
              placeholder: "Sebutkan prestasi, penghargaan, atau sertifikasi...",
              rows: 3,
            })}
            {renderInputField({
              label: "Link Video Perkenalan",
              name: "introVideoUrl",
              placeholder: "https://youtube.com/... atau https://drive.google.com/...",
              required: true,
              hint: "Video perkenalan maksimal 3 menit.",
            })}
          </div>
        </GoldCard>

        <div className="flex gap-3 flex-wrap">
          <GoldButton type="submit" variant="outline" size="md">
            <Save size={16} />
            Simpan Draft
          </GoldButton>
          <GoldButton
            type="button"
            variant="primary"
            size="md"
            onClick={handleSubmitToAdmin}
            disabled={completionProgress < 100}
          >
            <CheckCircle size={16} />
            Kirim ke Seleksi Admin
          </GoldButton>
          <GoldButton variant="outline" size="md" onClick={() => router.push("/pages/participant/dashboard")}>
            Batal
          </GoldButton>
        </div>
      </form>
    </div>
  );
}
