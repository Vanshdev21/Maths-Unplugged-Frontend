"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { useAuth } from "@/redux/hooks";
import { cn } from "@/lib/utils";

const links = [
  { href: "/courses", label: "Courses" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const pathname = usePathname();
  const { status, isAuthenticated } = useAuth();
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean | ((prev: boolean) => boolean)) =>
    setOpenOn((prev) => ((typeof value === "function" ? value(prev === pathname) : value) ? pathname : null));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-bg/85 backdrop-blur-md transition-colors",
        scrolled ? "border-border" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3.5 py-2 text-[15px] transition hover:text-fg",
                pathname === l.href ? "font-medium text-fg" : "text-muted",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {status === "loading" ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : isAuthenticated ? (
            <>
              <ButtonLink href="/my-courses" variant="ghost" size="sm" className="hidden sm:inline-flex">
                My courses
              </ButtonLink>
              <UserMenu />
            </>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <ButtonLink href="/login" variant="ghost" size="sm">
                Log in
              </ButtonLink>
              <ButtonLink href="/signup" variant="dark" size="sm">
                Sign up free
              </ButtonLink>
            </div>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-surface md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Portalled to <body>: the header's backdrop-blur would otherwise become
          the containing block for this fixed panel and collapse it to 0 height. */}
      {open && createPortal(
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-border bg-bg px-5 pt-4 pb-10 md:hidden"
        >
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpenOn(null)} className="block rounded-xl px-3 py-3.5 text-lg font-medium hover:bg-surface">
                  {l.label}
                </Link>
              </li>
            ))}
            {isAuthenticated && (
              <li>
                <Link href="/my-courses" onClick={() => setOpenOn(null)} className="block rounded-xl px-3 py-3.5 text-lg font-medium hover:bg-surface">
                  My courses
                </Link>
              </li>
            )}
          </ul>
          {!isAuthenticated && status !== "loading" && (
            <div className="mt-6 grid gap-2">
              <ButtonLink href="/signup" variant="primary" size="lg">
                Sign up free
              </ButtonLink>
              <ButtonLink href="/login" variant="outline" size="lg">
                Log in
              </ButtonLink>
            </div>
          )}
        </nav>,
        document.body,
      )}
    </header>
  );
}
