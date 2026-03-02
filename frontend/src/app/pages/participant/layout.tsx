"use client";

import React from "react";
import {
  LayoutDashboard,
  User,
  Upload,
  CheckCircle,
  Download,
} from "lucide-react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";

// Navigation khusus area peserta.
const participantNavItems = [
  { label: "Dashboard", href: "/pages/participant/dashboard", icon: <LayoutDashboard size={16} /> },
  { label: "Biodata", href: "/pages/participant/biodata", icon: <User size={16} /> },
  { label: "Upload Dokumen", href: "/pages/participant/dokumen", icon: <Upload size={16} /> },
  { label: "Status Seleksi", href: "/pages/participant/status", icon: <CheckCircle size={16} /> },
  { label: "Export PDF", href: "/pages/participant/export", icon: <Download size={16} /> },
];

export default function ParticipantPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Wrapper layout seluruh halaman /pages/participant/*
  return (
    <DashboardLayout navItems={participantNavItems} role="participant">
      {children}
    </DashboardLayout>
  );
}
