"use client";

import React, { useMemo, useState } from "react";
import { Download, CheckCircle } from "lucide-react";
import GoldCard from "../../../../components/dashboard/GoldCard";
import { GoldButton } from "../../../../components/ui/GoldButton";
import { useApp } from "../../../../context/AppContext";
import { criteriaList, stages, type Participant } from "../../../../data/mockData";

type GenderFilter = "Semua" | "Encik" | "Puan";

type ExportRow = Participant & {
  scores: number[];
  total: number;
};

type StageConfig = {
  key: string;
  label: string;
  sheetName: string;
};

const stageStatusMap: Record<string, string[]> = {
  Audition: ["Audition", "Verified", "Top20", "PreCamp", "Camp", "GrandFinal", "Winner"],
  "Pre-Camp": ["PreCamp", "Camp", "GrandFinal", "Winner"],
  Camp: ["Camp", "GrandFinal", "Winner"],
  "Grand Final": ["GrandFinal", "Winner"],
};

const exportStages: StageConfig[] = [
  { key: "Audition", label: "Audition", sheetName: "Audisi" },
  { key: "Pre-Camp", label: "Pre-Camp", sheetName: "Pra-Karantina" },
  { key: "Camp", label: "Camp", sheetName: "Karantina" },
  { key: "Grand Final", label: "Grand Final", sheetName: "GrandFinal" },
];

function normalizeStageName(stageName: string) {
  return stageName.toLowerCase().replace(/[\s-]/g, "");
}

function createDeterministicScore(seed: number, min = 65, max = 98) {
  return min + ((seed * 37 + 7) % (max - min + 1));
}

function toCsvCell(value: string | number) {
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toXmlSafe(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildWorkbookXml(
  sheets: Array<{ name: string; headers: string[]; rows: Array<Array<string | number>> }>
) {
  const worksheetXml = sheets
    .map((sheet) => {
      const headerCells = sheet.headers
        .map(
          (header) =>
            `<Cell><Data ss:Type="String">${toXmlSafe(header)}</Data></Cell>`
        )
        .join("");

      const rowXml = sheet.rows
        .map((row) => {
          const cells = row
            .map((cell) => {
              const isNumber = typeof cell === "number" || (!Number.isNaN(Number(cell)) && cell !== "");
              const type = isNumber ? "Number" : "String";
              return `<Cell><Data ss:Type="${type}">${toXmlSafe(cell)}</Data></Cell>`;
            })
            .join("");
          return `<Row>${cells}</Row>`;
        })
        .join("");

      return `
        <Worksheet ss:Name="${toXmlSafe(sheet.name)}">
          <Table>
            <Row>${headerCells}</Row>
            ${rowXml}
          </Table>
        </Worksheet>
      `;
    })
    .join("");

  return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  ${worksheetXml}
</Workbook>`;
}

function buildRowsForStage(
  stage: string,
  selectedGender: GenderFilter,
  participantList: Participant[],
  scoreList: Array<{
    participantId: string;
    stage: string;
    score: Record<string, number>;
  }>
): ExportRow[] {
  const validStatuses = stageStatusMap[stage] ?? [];
  const normalizedStage = normalizeStageName(stage);

  return participantList
    .filter(
      (participant) =>
        validStatuses.includes(participant.status) &&
        (selectedGender === "Semua" || participant.gender === selectedGender)
    )
    .map((participant, index) => {
      const stageScores = scoreList.filter(
        (score) =>
          score.participantId === participant.id &&
          normalizeStageName(score.stage) === normalizedStage
      );

      const criteriaScores = criteriaList.map((criteria, criteriaIndex) => {
        const fallbackSeed =
          participant.id.charCodeAt(participant.id.length - 1) + index + criteriaIndex;

        if (stageScores.length === 0) {
          return createDeterministicScore(fallbackSeed);
        }

        const average =
          stageScores.reduce((sum, item) => sum + item.score[criteria.key], 0) / stageScores.length;
        return Math.round(average);
      });

      const total = criteriaList.reduce(
        (sum, criteria, criteriaIndex) => sum + (criteriaScores[criteriaIndex] * criteria.weight) / 100,
        0
      );

      return {
        ...participant,
        scores: criteriaScores,
        total: Math.round(total * 100) / 100,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export default function AdminExportPage() {
  const { participantList, scoreList } = useApp();
  const [selectedStage, setSelectedStage] = useState("Grand Final");
  const [selectedGender, setSelectedGender] = useState<GenderFilter>("Semua");
  const [downloadingSingle, setDownloadingSingle] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [singleDone, setSingleDone] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const stageDataMap = useMemo(() => {
    const map: Record<string, ExportRow[]> = {};
    exportStages.forEach((stage) => {
      map[stage.key] = buildRowsForStage(stage.key, selectedGender, participantList, scoreList);
    });
    return map;
  }, [participantList, scoreList, selectedGender]);

  const tableData = stageDataMap[selectedStage] ?? [];

  const headers = [
    "Rank",
    "No Urut",
    "Nama",
    "Kategori",
    "Status",
    ...criteriaList.map((criteria) => criteria.label),
    "Total Nilai",
  ];

  const handleExportSingle = async () => {
    setDownloadingSingle(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setDownloadingSingle(false);
    setSingleDone(true);
    setTimeout(() => setSingleDone(false), 2500);

    const rows = tableData.map((participant, index) => [
      index + 1,
      participant.number,
      participant.name,
      participant.gender,
      participant.status,
      ...participant.scores,
      participant.total.toFixed(2),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => toCsvCell(cell)).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `Rekap_Nilai_DutaWisata_Batam_2026_${selectedStage.replace(/\s/g, "_")}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAllStages = async () => {
    setDownloadingAll(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setDownloadingAll(false);
    setAllDone(true);
    setTimeout(() => setAllDone(false), 2500);

    const sheets = exportStages.map((stage) => {
      const rows = (stageDataMap[stage.key] ?? []).map((participant, index) => [
        index + 1,
        participant.number,
        participant.name,
        participant.gender,
        participant.status,
        ...participant.scores,
        participant.total.toFixed(2),
      ]);

      return {
        name: stage.sheetName,
        headers,
        rows,
      };
    });

    const workbookXml = buildWorkbookXml(sheets);
    const blob = new Blob([workbookXml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "Rekap_Nilai_DutaWisata_Batam_2026_Semua_Tahap.xls";
    anchor.click();
    URL.revokeObjectURL(url);
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
          Export Data
        </h1>
        <p className="text-sm mt-1" style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}>
          Export rekap nilai dan data peserta ke format CSV/Excel
        </p>
      </div>

      <GoldCard glow className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label
              className="block text-xs mb-2"
              style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}
            >
              Filter Tahap:
            </label>
            <div className="flex gap-2 flex-wrap">
              {stages.map((stage) => (
                <button
                  key={stage}
                  onClick={() => setSelectedStage(stage)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background:
                      selectedStage === stage
                        ? "linear-gradient(135deg, #F5D06F, #D4AF37)"
                        : "rgba(212,175,55,0.08)",
                    color: selectedStage === stage ? "#0F0F0F" : "#D4AF37",
                    border: `1px solid ${selectedStage === stage ? "transparent" : "rgba(212,175,55,0.2)"}`,
                    fontFamily: "var(--font-cinzel)",
                    cursor: "pointer",
                  }}
                  type="button"
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              className="block text-xs mb-2"
              style={{ color: "#D4AF37", fontFamily: "var(--font-poppins)", fontWeight: 600 }}
            >
              Filter Kategori:
            </label>
            <div className="flex gap-2">
              {(["Semua", "Encik", "Puan"] as const).map((gender) => (
                <button
                  key={gender}
                  onClick={() => setSelectedGender(gender)}
                  className="px-4 py-2 rounded-xl text-xs transition-all"
                  style={{
                    background: selectedGender === gender ? "rgba(212,175,55,0.15)" : "transparent",
                    border: `1px solid ${selectedGender === gender ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}`,
                    color: selectedGender === gender ? "#D4AF37" : "#888",
                    fontFamily: "var(--font-poppins)",
                    cursor: "pointer",
                  }}
                  type="button"
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-auto flex gap-2">
            <GoldButton variant="outline" onClick={handleExportSingle} disabled={downloadingSingle || downloadingAll}>
              {singleDone ? (
                <>
                  <CheckCircle size={16} />
                  Berhasil!
                </>
              ) : downloadingSingle ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export Tahap Aktif
                </>
              )}
            </GoldButton>
            <GoldButton variant="primary" onClick={handleExportAllStages} disabled={downloadingAll || downloadingSingle}>
              {allDone ? (
                <>
                  <CheckCircle size={16} />
                  Berhasil!
                </>
              ) : downloadingAll ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export Semua Tahap (Excel)
                </>
              )}
            </GoldButton>
          </div>
        </div>
      </GoldCard>

      <GoldCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}>
            Preview: Rekap Nilai Tahap {selectedStage}
          </h3>
          <span
            className="text-xs px-3 py-1 rounded-full"
            style={{ background: "rgba(212,175,55,0.1)", color: "#D4AF37", fontFamily: "var(--font-poppins)" }}
          >
            {tableData.length} peserta
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ fontFamily: "var(--font-poppins)" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(212,175,55,0.08)",
                  borderBottom: "1px solid rgba(212,175,55,0.15)",
                }}
              >
                <th className="px-3 py-2 text-left whitespace-nowrap" style={{ color: "#D4AF37" }}>
                  Rank
                </th>
                <th className="px-3 py-2 text-left whitespace-nowrap" style={{ color: "#D4AF37" }}>
                  No.
                </th>
                <th className="px-3 py-2 text-left whitespace-nowrap" style={{ color: "#D4AF37" }}>
                  Nama
                </th>
                <th className="px-3 py-2 text-left whitespace-nowrap" style={{ color: "#D4AF37" }}>
                  Kat.
                </th>
                {criteriaList.map((criteria) => (
                  <th
                    key={criteria.key}
                    className="px-3 py-2 text-center whitespace-nowrap"
                    style={{ color: "#D4AF37" }}
                  >
                    {criteria.label.split(" ")[0]}
                  </th>
                ))}
                <th className="px-3 py-2 text-center whitespace-nowrap" style={{ color: "#D4AF37" }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((participant, index) => (
                <tr key={participant.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-3 py-2.5">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                      style={{
                        background:
                          index === 0
                            ? "linear-gradient(135deg, #F5D06F, #D4AF37)"
                            : index === 1
                            ? "rgba(192,192,192,0.3)"
                            : index === 2
                            ? "rgba(205,127,50,0.3)"
                            : "rgba(255,255,255,0.05)",
                        color: index < 3 ? "#0F0F0F" : "#888",
                        fontFamily: "var(--font-cinzel)",
                      }}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-3 py-2.5" style={{ color: "#888" }}>
                    {participant.number}
                  </td>
                  <td className="px-3 py-2.5">
                    <span style={{ color: "#F5E6C8", fontWeight: index < 3 ? 600 : 400 }}>
                      {participant.name}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span style={{ color: participant.gender === "Encik" ? "#60a5fa" : "#f472b6" }}>
                      {participant.gender}
                    </span>
                  </td>
                  {participant.scores.map((score, scoreIndex) => (
                    <td
                      key={`${participant.id}-${scoreIndex}`}
                      className="px-3 py-2.5 text-center"
                      style={{ color: score >= 90 ? "#22c55e" : score >= 80 ? "#D4AF37" : "#BDBDBD" }}
                    >
                      {score}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 text-center">
                    <span className="font-bold" style={{ color: index === 0 ? "#D4AF37" : "#F5E6C8" }}>
                      {participant.total.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GoldCard>
    </div>
  );
}
