"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const browseLinks = [
  { label: "by Cuticular Protein", href: "/browse" },
  { label: "by Protein Family", href: "/families" },
  { label: "by Species", href: "/species" },
];

const primaryLinks = [
  { label: "Download", href: "/downloads" },
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

function isBrowseSectionActive(pathname: string) {
  return browseLinks.some((link) => isActiveLink(pathname, link.href));
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBrowseDropdownOpen, setIsBrowseDropdownOpen] = useState(false);

  const allMobileLinks = [...primaryLinks, ...mobileExtraLinks];
  const browseActive = isBrowseSectionActive(pathname);

  function closeMenus() {
    setIsMenuOpen(false);
    setIsBrowseDropdownOpen(false);
  }

  return (
    <header className="border-b border-[#d8cbb7] bg-[#fffaf1]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between py-5">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-[#2a2118]"
            onClick={closeMenus}
          >
            Cuticulome.org
          </Link>

          <nav className="hidden items-center gap-4 text-xs font-semibold text-[#6a5d4d] lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setIsBrowseDropdownOpen(true)}
              onMouseLeave={() => setIsBrowseDropdownOpen(false)}
            >
              <Link
                href="/browse"
                onClick={closeMenus}
                onFocus={() => setIsBrowseDropdownOpen(true)}
                className={
                  browseActive
                    ? "rounded-full bg-[#2a2118] px-3 py-2 text-white"
                    : "rounded-full px-3 py-2 hover:bg-[#efe5d4] hover:text-[#2a2118]"
                }
                aria-expanded={isBrowseDropdownOpen}
                aria-haspopup="menu"
              >
                Browse
              </Link>

              {isBrowseDropdownOpen && (
                <div className="absolute left-0 top-full z-50 pt-2">
                  <div className="min-w-[220px] rounded-2xl border border-[#d8cbb7] bg-[#fffdf8] p-2 shadow-lg">
                    {browseLinks.map((link) => {
                      const active = isActiveLink(pathname, link.href);

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={closeMenus}
                          className={
                            active
                              ? "block rounded-xl bg-[#2a2118] px-4 py-3 text-sm font-semibold text-white"
                              : "block rounded-xl px-4 py-3 text-sm font-semibold text-[#6a5d4d] hover:bg-[#efe5d4] hover:text-[#2a2118]"
                          }
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {primaryLinks.map((link) => {
              const active = isActiveLink(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsBrowseDropdownOpen(false)}
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
            <div className="rounded-2xl border border-[#d8cbb7] bg-[#fffdf8] p-2">
              <Link
                href="/browse"
                onClick={closeMenus}
                className={
                  browseActive
                    ? "block rounded-xl bg-[#2a2118] px-4 py-3 text-sm font-semibold text-white"
                    : "block rounded-xl px-4 py-3 text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
                }
              >
                Browse
              </Link>

              <div className="mt-1 grid gap-1">
                {browseLinks.map((link) => {
                  const active = isActiveLink(pathname, link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenus}
                      className={
                        active
                          ? "rounded-xl bg-[#efe5d4] px-4 py-3 text-sm font-semibold text-[#2a2118]"
                          : "rounded-xl px-4 py-3 text-sm font-semibold text-[#6a5d4d] hover:bg-[#efe5d4] hover:text-[#2a2118]"
                      }
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {allMobileLinks.map((link) => {
              const active = isActiveLink(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenus}
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
