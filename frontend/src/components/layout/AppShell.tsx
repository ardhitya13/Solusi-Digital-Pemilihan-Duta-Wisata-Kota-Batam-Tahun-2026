"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PUBLIC_ROUTES = ["/", "/about", "/news", "/vote", "/faq", "/feedback"];

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;

  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") return false;
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const showPublicLayout = isPublicRoute(pathname);

  return (
    <>
      {showPublicLayout ? <Navbar /> : null}
      <main className={showPublicLayout ? "pt-20" : ""}>{children}</main>
      {showPublicLayout ? <Footer /> : null}
    </>
  );
}

