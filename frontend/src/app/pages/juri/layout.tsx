"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Star } from "lucide-react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { useApp } from "../../../context/AppContext";

const judgeNavItems = [
  { label: "Dashboard", href: "/pages/juri/dashboard", icon: <LayoutDashboard size={16} /> },
  { label: "Input Penilaian", href: "/pages/juri/scoring", icon: <Star size={16} /> },
];

export default function JudgePagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (user.role !== "judge") {
      router.replace("/");
    }
  }, [router, user]);

  if (!user || user.role !== "judge") return null;

  return (
    <DashboardLayout navItems={judgeNavItems} role="judge">
      {children}
    </DashboardLayout>
  );
}
