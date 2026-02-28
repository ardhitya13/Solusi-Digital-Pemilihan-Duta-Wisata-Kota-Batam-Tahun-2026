import Link from "next/link";
import { Calendar, ArrowLeft } from "lucide-react";
import { mockNews, type NewsBlock } from "../../../data/mockData";
import NewsArticleClient from "../components/NewsArticleClient";

function formatDateId(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = mockNews.find((n) => n.id === id);
  const articleBody: NewsBlock[] =
    news && news.body.length > 0
      ? news.body
      : [{ type: "paragraph", text: news?.excerpt ?? "" }];

  if (!news) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24" style={{ color: "#F5E6C8" }}>
        <p className="mb-6" style={{ fontFamily: "var(--font-poppins)" }}>
          Berita tidak ditemukan.
        </p>
        <Link href="/news" className="underline" style={{ color: "#D4AF37" }}>
          Kembali ke News
        </Link>
      </div>
    );
  }

  return (
    <article className="pb-20">
      {/* Hero */}
      <div className="relative w-full overflow-hidden" style={{ height: 420 }}>
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover"
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.85) 70%, #0F0F0F 100%)",
          }}
        />

        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm mb-6"
              style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)" }}
            >
              <ArrowLeft size={16} /> Kembali
            </Link>

            <div className="flex items-center gap-3 mb-3">
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #F5D06F, #D4AF37)",
                  color: "#0F0F0F",
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                }}
              >
                {news.category}
              </span>

              <div className="flex items-center gap-2 text-xs">
                <Calendar size={12} style={{ color: "#D4AF37" }} />
                <span
                  style={{
                    color: "#BDBDBD",
                    fontFamily: "var(--font-poppins)",
                  }}
                >
                  {formatDateId(news.date)}
                </span>
              </div>
            </div>

            <h1
              className="leading-tight"
              style={{
                color: "#F5E6C8",
                fontFamily: "var(--font-cinzel)",
                fontSize: "clamp(1.7rem, 3vw, 2.7rem)",
                fontWeight: 800,
              }}
            >
              {news.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Body card (Figma card style) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div
          className="rounded-2xl p-6 sm:p-10"
          style={{
            background: "#1A1A1A",
            border: "1px solid rgba(212,175,55,0.25)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {/* lead/excerpt */}
          <p
            className="mb-7"
            style={{
              color: "#F5E6C8",
              fontFamily: "var(--font-poppins)",
              lineHeight: 1.9,
              fontWeight: 600,
            }}
          >
            {news.excerpt}
          </p>

          <div
            className="w-full h-px mb-8"
            style={{ background: "rgba(212,175,55,0.15)" }}
          />

          <NewsArticleClient body={articleBody} />
        </div>
      </div>
    </article>
  );
}
