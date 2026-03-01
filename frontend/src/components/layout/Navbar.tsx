"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoldButton } from "../ui/GoldButton";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "News", href: "/news" },
  { label: "Vote", href: "/vote" },
  { label: "FAQ", href: "/faq" },
  { label: "Feedback", href: "/feedback" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[9999] transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(10, 10, 10, 0.95)"
          : "linear-gradient(180deg, rgba(10,10,10,0.8) 0%, transparent 100%)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(212,175,55,0.2)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setMenuOpen(false)}
          >
            <Image
              src="/logo.png"
              alt="Duta Wisata Batam"
              width={48}
              height={48}
              className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
              priority
            />
            <div className="block max-w-[140px] sm:max-w-none">
              <p
                className="text-[10px] sm:text-xs leading-tight truncate"
                style={{
                  color: "#D4AF37",
                  fontFamily: "var(--font-cinzel)",
                  letterSpacing: "0.08em",
                }}
              >
                DUTA WISATA
              </p>
              <p
                className="text-[10px] sm:text-xs leading-tight truncate"
                style={{
                  color: "#F5E6C8",
                  fontFamily: "var(--font-poppins)",
                  opacity: 0.8,
                }}
              >
                KOTA BATAM 2026
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm transition-colors duration-200 hover:opacity-80"
                style={{
                  color: isActive(link.href) ? "#D4AF37" : "#F5E6C8",
                  fontFamily: "var(--font-poppins)",
                  letterSpacing: "0.05em",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
              <GoldButton variant="outline" size="sm">
                Login
              </GoldButton>
            </Link>
            <Link href="/auth/register" onClick={() => setMenuOpen(false)}>
              <GoldButton variant="primary" size="sm">
                Register
              </GoldButton>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg"
            style={{ color: "#D4AF37", background: "rgba(212,175,55,0.1)" }}
            onClick={() => setMenuOpen((v) => !v)}
            type="button"
            aria-label="Toggle menu"
          >
            <span className="text-lg">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            className="lg:hidden py-4 border-t"
            style={{
              borderColor: "rgba(212,175,55,0.2)",
              background: "rgba(10,10,10,0.98)",
            }}
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-left px-4 py-3 rounded-lg text-sm transition-colors hover:bg-white/5"
                  style={{
                    color: isActive(link.href) ? "#D4AF37" : "#F5E6C8",
                    fontFamily: "var(--font-poppins)",
                  }}
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex flex-col gap-2 px-4 pt-3">
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                  <GoldButton variant="outline" fullWidth>
                    Login
                  </GoldButton>
                </Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)}>
                  <GoldButton variant="primary" fullWidth>
                    Register
                  </GoldButton>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
