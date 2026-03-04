"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit, Save, X, Calendar, Tag, ImagePlus, Quote } from "lucide-react";
import GoldCard from "../../../../components/dashboard/GoldCard";
import { GoldButton } from "../../../../components/ui/GoldButton";
import { useApp } from "../../../../context/AppContext";
import type { NewsBlock, NewsItem } from "../../../../data/mockData";

const categories = ["Pengumuman", "Jadwal", "Informasi", "Inspirasi", "Hasil", "Lainnya"];
const defaultImage = "https://images.unsplash.com/photo-1562428580-33e2cc141402?w=800&q=80";

type NewsFormState = {
  title: string;
  content: string;
  coverImage: string;
  date: string;
  category: string;
};

type BodyImageInput = {
  id: string;
  src: string;
  caption: string;
};

type QuoteInput = {
  id: string;
  text: string;
  author: string;
};

type ParseResult = {
  blocks: NewsBlock[];
  errors: string[];
};

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function createImageInput(src = "", caption = "", seed = Date.now()) {
  return { id: `img-${seed}-${Math.random()}`, src, caption };
}

function createQuoteInput(text = "", author = "", seed = Date.now()) {
  return { id: `q-${seed}-${Math.random()}`, text, author };
}

function toExcerpt(content: string) {
  const firstNonTokenLine = content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("/"));
  const base = firstNonTokenLine ?? content.trim();
  if (base.length <= 130) return base;
  return `${base.slice(0, 127)}...`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

function parseContentToBlocks(
  content: string,
  imageInputs: BodyImageInput[],
  quoteInputs: QuoteInput[]
): ParseResult {
  const errors: string[] = [];
  const blocks: NewsBlock[] = [];
  const paragraphBuffer: string[] = [];
  const listBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push({ type: "paragraph", text: paragraphBuffer.join(" ") });
      paragraphBuffer.length = 0;
    }
  };

  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push({ type: "list", items: [...listBuffer] });
      listBuffer.length = 0;
    }
  };

  const lines = content.split("\n");
  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const imageMatch = trimmed.match(/^\/gambar\s+(\d+)$/i);
    if (imageMatch) {
      flushParagraph();
      flushList();
      const index = Number(imageMatch[1]) - 1;
      const image = imageInputs[index];
      if (!image || !image.src) {
        errors.push(`Baris ${lineIndex + 1}: /gambar ${index + 1} belum tersedia.`);
      } else {
        blocks.push({
          type: "image",
          src: image.src,
          alt: `Dokumentasi berita ${index + 1}`,
          caption: image.caption.trim() || `Dokumentasi berita ${index + 1}`,
        });
      }
      return;
    }

    const quoteMatch = trimmed.match(/^\/kutipan\s+(\d+)$/i);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      const index = Number(quoteMatch[1]) - 1;
      const quote = quoteInputs[index];
      if (!quote || !quote.text.trim()) {
        errors.push(`Baris ${lineIndex + 1}: /kutipan ${index + 1} belum tersedia.`);
      } else {
        blocks.push({
          type: "quote",
          text: quote.text.trim(),
          author: quote.author.trim() || undefined,
        });
      }
      return;
    }

    const headingMatch = trimmed.match(/^\/judul\s+(.+)$/i);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: headingMatch[1].trim() });
      return;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      listBuffer.push(listMatch[1].trim());
      return;
    }

    flushList();
    paragraphBuffer.push(trimmed);
  });

  flushParagraph();
  flushList();

  if (blocks.length === 0) {
    errors.push("Konten berita kosong atau format token belum valid.");
  }

  return { blocks, errors };
}

function mapBodyToEditor(body: NewsBlock[]) {
  const images: BodyImageInput[] = [];
  const quotes: QuoteInput[] = [];
  const contentLines: string[] = [];

  body.forEach((block) => {
    if (block.type === "paragraph") {
      contentLines.push(block.text);
      contentLines.push("");
      return;
    }

    if (block.type === "heading") {
      contentLines.push(`/judul ${block.text}`);
      contentLines.push("");
      return;
    }

    if (block.type === "list") {
      block.items.forEach((item) => contentLines.push(`- ${item}`));
      contentLines.push("");
      return;
    }

    if (block.type === "image") {
      images.push(createImageInput(block.src, block.caption ?? ""));
      contentLines.push(`/gambar ${images.length}`);
      contentLines.push("");
      return;
    }

    if (block.type === "quote") {
      quotes.push(createQuoteInput(block.text, block.author ?? ""));
      contentLines.push(`/kutipan ${quotes.length}`);
      contentLines.push("");
    }
  });

  return {
    images,
    quotes,
    content: contentLines.join("\n").trim(),
  };
}

export default function AdminNewsPage() {
  const { newsList, setNewsList } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string>("");
  const [bodyImages, setBodyImages] = useState<BodyImageInput[]>([]);
  const [quotes, setQuotes] = useState<QuoteInput[]>([]);
  const [form, setForm] = useState<NewsFormState>({
    title: "",
    content: "",
    coverImage: "",
    date: getTodayDate(),
    category: "Pengumuman",
  });

  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      coverImage: "",
      date: getTodayDate(),
      category: "Pengumuman",
    });
    setBodyImages([]);
    setQuotes([]);
    setEditId(null);
    setShowForm(false);
    setFormError("");
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.content.trim()) {
      setFormError("Judul dan isi berita wajib diisi.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    const parsed = parseContentToBlocks(form.content, bodyImages, quotes);
    if (parsed.errors.length > 0) {
      setIsSaving(false);
      setFormError(parsed.errors[0]);
      return;
    }

    const payload = {
      title: form.title.trim(),
      image: form.coverImage || defaultImage,
      date: form.date,
      category: form.category,
      excerpt: toExcerpt(form.content),
      body: parsed.blocks,
    };

    if (editId) {
      setNewsList((prev) => prev.map((item) => (item.id === editId ? { ...item, ...payload } : item)));
    } else {
      const newItem: NewsItem = {
        id: `n${Date.now()}`,
        ...payload,
      };
      setNewsList((prev) => [newItem, ...prev]);
    }

    setIsSaving(false);
    resetForm();
  };

  const handleEdit = (item: NewsItem) => {
    const mapped = mapBodyToEditor(item.body);
    setEditId(item.id);
    setForm({
      title: item.title,
      content: mapped.content || item.excerpt,
      coverImage: item.image,
      date: item.date,
      category: item.category,
    });
    setBodyImages(mapped.images);
    setQuotes(mapped.quotes);
    setFormError("");
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setNewsList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCoverImageChange = async (file: File | null) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setForm((prev) => ({ ...prev, coverImage: dataUrl }));
  };

  const handleBodyImageFileChange = async (imageId: string, file: File | null) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setBodyImages((prev) => prev.map((item) => (item.id === imageId ? { ...item, src: dataUrl } : item)));
  };

  const inputStyle: React.CSSProperties = {
    background: "#111",
    border: "1px solid rgba(212,175,55,0.25)",
    color: "#F5E6C8",
    fontFamily: "var(--font-poppins)",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 style={{ fontFamily: "var(--font-cinzel)", color: "#D4AF37", fontSize: "1.5rem", fontWeight: 700 }}>
            Kelola Berita
          </h1>
          <p className="text-sm mt-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
            Atur urutan konten berita dengan token slash: /gambar 1, /kutipan 1, /judul.
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
            setForm({
              title: "",
              content: "",
              coverImage: "",
              date: getTodayDate(),
              category: "Pengumuman",
            });
            setBodyImages([]);
            setQuotes([]);
            setFormError("");
            setShowForm(true);
          }}
        >
          <Plus size={14} />
          Tambah Berita
        </GoldButton>
      </div>

      {showForm ? (
        <GoldCard glow className="mb-6">
          <h3
            className="text-sm font-bold mb-5 pb-3"
            style={{
              color: "#D4AF37",
              fontFamily: "var(--font-cinzel)",
              borderBottom: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            {editId ? "Edit Berita" : "Berita Baru"}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}>
                Judul Berita *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Masukkan judul berita..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}>
                  Tanggal
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}>
                  Kategori
                </label>
                <select
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}>
                Background Berita (Cover) *
              </label>
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleCoverImageChange(event.target.files?.[0] ?? null)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={inputStyle}
                />
                {form.coverImage ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(212,175,55,0.25)" }}>
                    <Image src={form.coverImage} alt="Preview cover berita" fill unoptimized className="object-cover" />
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}>
                Konten / Isi Berita *
              </label>
              <textarea
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                placeholder={`Contoh:
Ini paragraf 1

Ini paragraf 2

/gambar 1
/kutipan 1

- Jadwal item 1
- Jadwal item 2`}
                rows={11}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={inputStyle}
              />
              <p className="text-xs mt-2" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
                Urutan output mengikuti urutan token di sini. Gunakan `/gambar n` dan `/kutipan n`.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs" style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}>
                    Bank Gambar
                  </label>
                  <button
                    type="button"
                    onClick={() => setBodyImages((prev) => [...prev, createImageInput()])}
                    className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                    style={{
                      background: "rgba(212,175,55,0.12)",
                      border: "1px solid rgba(212,175,55,0.22)",
                      color: "#D4AF37",
                      fontFamily: "var(--font-poppins)",
                      cursor: "pointer",
                    }}
                  >
                    <ImagePlus size={12} />
                    Tambah Image
                  </button>
                </div>
                <div className="space-y-3">
                  {bodyImages.length === 0 ? (
                    <p className="text-xs" style={{ color: "#666", fontFamily: "var(--font-poppins)" }}>
                      Belum ada gambar.
                    </p>
                  ) : (
                    bodyImages.map((imageItem, index) => (
                      <div key={imageItem.id} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.16)" }}>
                        <p className="text-xs mb-2" style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)" }}>
                          Gambar {index + 1} - panggil dengan `/gambar {index + 1}`
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleBodyImageFileChange(imageItem.id, event.target.files?.[0] ?? null)}
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-2"
                          style={inputStyle}
                        />
                        <input
                          type="text"
                          value={imageItem.caption}
                          onChange={(event) =>
                            setBodyImages((prev) =>
                              prev.map((item) => (item.id === imageItem.id ? { ...item, caption: event.target.value } : item))
                            )
                          }
                          placeholder="Caption gambar (opsional)"
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-2"
                          style={inputStyle}
                        />
                        {imageItem.src ? (
                          <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2" style={{ border: "1px solid rgba(212,175,55,0.2)" }}>
                            <Image src={imageItem.src} alt={`Preview gambar ${index + 1}`} fill unoptimized className="object-cover" />
                          </div>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setBodyImages((prev) => prev.filter((item) => item.id !== imageItem.id))}
                          className="px-3 py-1.5 rounded-lg text-xs"
                          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontFamily: "var(--font-poppins)", cursor: "pointer" }}
                        >
                          Hapus Gambar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs" style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}>
                    Bank Kutipan
                  </label>
                  <button
                    type="button"
                    onClick={() => setQuotes((prev) => [...prev, createQuoteInput()])}
                    className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                    style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.22)", color: "#D4AF37", fontFamily: "var(--font-poppins)", cursor: "pointer" }}
                  >
                    <Quote size={12} />
                    Tambah Kutipan
                  </button>
                </div>
                <div className="space-y-3">
                  {quotes.length === 0 ? (
                    <p className="text-xs" style={{ color: "#666", fontFamily: "var(--font-poppins)" }}>
                      Belum ada kutipan.
                    </p>
                  ) : (
                    quotes.map((quoteItem, index) => (
                      <div key={quoteItem.id} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.16)" }}>
                        <p className="text-xs mb-2" style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)" }}>
                          Kutipan {index + 1} - panggil dengan `/kutipan {index + 1}`
                        </p>
                        <textarea
                          value={quoteItem.text}
                          onChange={(event) =>
                            setQuotes((prev) =>
                              prev.map((item) => (item.id === quoteItem.id ? { ...item, text: event.target.value } : item))
                            )
                          }
                          placeholder="Isi kutipan..."
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none mb-2"
                          style={inputStyle}
                        />
                        <input
                          type="text"
                          value={quoteItem.author}
                          onChange={(event) =>
                            setQuotes((prev) =>
                              prev.map((item) => (item.id === quoteItem.id ? { ...item, author: event.target.value } : item))
                            )
                          }
                          placeholder="Sumber/author kutipan"
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-2"
                          style={inputStyle}
                        />
                        <button
                          type="button"
                          onClick={() => setQuotes((prev) => prev.filter((item) => item.id !== quoteItem.id))}
                          className="px-3 py-1.5 rounded-lg text-xs"
                          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontFamily: "var(--font-poppins)", cursor: "pointer" }}
                        >
                          Hapus Kutipan
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {formError ? (
            <p className="mt-4 text-xs" style={{ color: "#ef4444", fontFamily: "var(--font-poppins)" }}>
              {formError}
            </p>
          ) : null}

          <div className="flex gap-3 mt-5">
            <GoldButton variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save size={14} />
              {isSaving ? "Menyimpan..." : "Simpan"}
            </GoldButton>
            <GoldButton variant="outline" size="sm" onClick={resetForm}>
              <X size={14} />
              Batal
            </GoldButton>
          </div>
        </GoldCard>
      ) : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {newsList.map((item) => (
          <div key={item.id} className="rounded-2xl overflow-hidden" style={{ background: "#1A1A1A", border: "1px solid rgba(212,175,55,0.2)" }}>
            <div className="relative overflow-hidden" style={{ height: "140px" }}>
              <Image src={item.image} alt={item.title} fill unoptimized className="object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(26,26,26,0.8) 0%, transparent 60%)" }} />
              <span
                className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{
                  background: "linear-gradient(135deg, #F5D06F, #D4AF37)",
                  color: "#0F0F0F",
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                }}
              >
                <Tag size={10} />
                {item.category}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={11} style={{ color: "#D4AF37" }} />
                <span className="text-xs" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
                  {new Date(item.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <h4 className="text-sm font-semibold mb-2 line-clamp-2" style={{ color: "#F5E6C8", fontFamily: "var(--font-cinzel)" }}>
                {item.title}
              </h4>
              <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: "#888", fontFamily: "var(--font-poppins)" }}>
                {item.excerpt}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
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
                  <Edit size={11} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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
                  <Trash2 size={11} />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
