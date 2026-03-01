"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, ChevronRight } from "lucide-react";
import { useApp } from "../../context/AppContext";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type DashboardLayoutProps = {
  navItems: NavItem[];
  children: React.ReactNode;
  role: "participant" | "admin" | "judge";
};

export default function DashboardLayout({
  navItems,
  children,
  role,
}: DashboardLayoutProps) {
  const { user, logout, currentParticipant, participantList } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const participant = currentParticipant ?? participantList[0] ?? null;
  const profilePhoto = role === "participant" ? participant?.photo : undefined;

  const roleColors = {
    participant: "#D4AF37",
    admin: "#F5D06F",
    judge: "#B68D2A",
  } as const;

  const roleLabel = {
    participant: "Peserta",
    admin: "Administrator",
    judge: "Dewan Juri",
  } as const;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b" style={{ borderColor: "rgba(212,175,55,0.2)" }}>
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo Duta Wisata Batam"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
            style={{ filter: "drop-shadow(0 0 8px rgba(212,175,55,0.4))" }}
          />
          <div>
            <p
              className="text-xs font-bold leading-tight"
              style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}
            >
              DUTA WISATA
            </p>
            <p
              className="text-xs leading-tight"
              style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)", opacity: 0.7 }}
            >
              BATAM 2026
            </p>
          </div>
        </div>
      </div>

      <div
        className="px-4 py-4 mx-3 mt-4 rounded-xl"
        style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)" }}
      >
        {profilePhoto ? (
          <Image
            src={profilePhoto}
            alt={user?.name ?? "Foto Profil"}
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 rounded-full object-cover mb-2"
            style={{ border: "1px solid rgba(212,175,55,0.45)" }}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center mb-2"
            style={{ background: "linear-gradient(135deg, #F5D06F, #8C6A1C)" }}
          >
            <span
              style={{
                color: "#0F0F0F",
                fontFamily: "var(--font-cinzel)",
                fontWeight: 700,
                fontSize: "0.75rem",
              }}
            >
              {user?.name?.charAt(0).toUpperCase() ?? "P"}
            </span>
          </div>
        )}
        <p
          className="text-xs font-semibold truncate"
          style={{ color: "#F5E6C8", fontFamily: "var(--font-poppins)" }}
        >
          {user?.name ?? "Peserta"}
        </p>
        <span
          className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
          style={{
            background: "rgba(212,175,55,0.15)",
            color: roleColors[role],
            fontFamily: "var(--font-poppins)",
          }}
        >
          {roleLabel[role]}
        </span>
        {role === "participant" ? (
          <button
            onClick={() => {
              router.push("/pages/participant/biodata");
              setSidebarOpen(false);
            }}
            className="w-full mt-3 px-3 py-2 rounded-lg text-xs text-left transition-all duration-200"
            style={{
              background: "rgba(212,175,55,0.12)",
              border: "1px solid rgba(212,175,55,0.28)",
              color: "#F5D06F",
              fontFamily: "var(--font-poppins)",
            }}
            type="button"
          >
            Edit Profil
          </button>
        ) : null}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all duration-200"
              style={{
                background: isActive ? "rgba(212,175,55,0.15)" : "transparent",
                border: isActive ? "1px solid rgba(212,175,55,0.3)" : "1px solid transparent",
                color: isActive ? "#D4AF37" : "#BDBDBD",
                fontFamily: "var(--font-poppins)",
              }}
              type="button"
            >
              <span style={{ color: isActive ? "#D4AF37" : "#888" }}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {isActive ? <ChevronRight size={14} style={{ color: "#D4AF37" }} /> : null}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200"
          style={{
            color: "#ff6b6b",
            fontFamily: "var(--font-poppins)",
            background: "rgba(255,107,107,0.05)",
            border: "1px solid rgba(255,107,107,0.1)",
          }}
          type="button"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen" style={{ background: "#0F0F0F" }}>
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0"
        style={{ background: "#141414", borderRight: "1px solid rgba(212,175,55,0.15)" }}
      >
        {renderSidebarContent()}
      </aside>

      {sidebarOpen ? (
        <div className="lg:hidden fixed inset-0 z-40 flex" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)" }} />
          <aside
            className="relative z-50 w-64 flex flex-col"
            style={{ background: "#141414", borderRight: "1px solid rgba(212,175,55,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarContent()}
          </aside>
        </div>
      ) : null}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="h-14 flex items-center justify-between px-4 lg:px-6 shrink-0"
          style={{ background: "#141414", borderBottom: "1px solid rgba(212,175,55,0.15)" }}
        >
          <button
            className="lg:hidden p-2 rounded-lg"
            style={{ color: "#D4AF37", background: "rgba(212,175,55,0.1)" }}
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <Menu size={18} />
          </button>
          <div className="lg:hidden flex items-center gap-2">
            <span
              className="text-sm font-semibold"
              style={{ color: "#D4AF37", fontFamily: "var(--font-cinzel)" }}
            >
              DUTA WISATA BATAM 2026
            </span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <span
              className="text-xs"
              style={{ color: "#BDBDBD", fontFamily: "var(--font-poppins)" }}
            >
              {user?.email}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
