"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const primaryLinks = [
  { label: "Browse", href: "/browse" },
  { label: "Families", href: "/families" },
  { label: "Species", href: "/species" },
  { label: "Statistics", href: "/statistics" },
  { label: "Downloads", href: "/downloads" },
  { label: "miniBLAST", href: "/tools/miniblast" },
  { label: "Classifier", href: "/tools/classifier" },
  { label: "Help", href: "/help" },
];

const mobileExtraLinks = [
  { label: "Submit protein", href: "/submit" },
  { label: "Contact", href: "/contact" },
];

function isActiveLink(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const allMobileLinks = [...primaryLinks, ...mobileExtraLinks];

  return (
    <header className="border-b border-[#d8cbb7] bg-[#fffaf1]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between py-5">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-[#2a2118]"
            onClick={() => setIsMenuOpen(false)}
          >
            Cuticulome.db
          </Link>

          <nav className="hidden items-center gap-4 text-xs font-semibold text-[#6a5d4d] lg:flex">
            {primaryLinks.map((link) => {
              const active = isActiveLink(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "rounded-full bg-[#2a2118] px-3 py-2 text-white"
                      : "rounded-full px-3 py-2 hover:bg-[#efe5d4] hover:text-[#2a2118]"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
            className="inline-flex items-center rounded-full border border-[#c8b89d] px-4 py-2 text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4] lg:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {isMenuOpen && (
          <nav
            id="mobile-navigation"
            className="grid gap-2 border-t border-[#d8cbb7] py-5 lg:hidden"
          >
            {allMobileLinks.map((link) => {
              const active = isActiveLink(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={
                    active
                      ? "rounded-2xl bg-[#2a2118] px-4 py-3 text-sm font-semibold text-white"
                      : "rounded-2xl px-4 py-3 text-sm font-semibold text-[#6a5d4d] hover:bg-[#efe5d4] hover:text-[#2a2118]"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
