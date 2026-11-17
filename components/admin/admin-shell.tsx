"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Bell, BookOpen, LayoutDashboard, Menu, Paintbrush, ReceiptIndianRupee, Users, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { useGetNotificationsQuery } from "@/redux/api/adminApi";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ReceiptIndianRupee },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/customize", label: "Homepage", icon: Paintbrush },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The drawer belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);
  const { data } = useGetNotificationsQuery(undefined, { pollingInterval: 30_000, skipPollingIfUnfocused: true });
  const unread = data?.unreadCount ?? 0;

  const links = (
    <ul className="space-y-1">
      {nav.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                active ? "bg-fg font-medium text-bg" : "text-muted hover:bg-surface hover:text-fg",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span className="flex-1">{label}</span>
              {href === "/admin/notifications" && unread > 0 && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-black tabular">{unread}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border p-4 lg:flex">
        <div className="px-2 py-2">
          <Logo />
        </div>
        <nav aria-label="Admin" className="mt-8 flex-1">
          {links}
        </nav>
        <Link href="/" className="rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-surface hover:text-fg">
          View website
        </Link>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-bg/90 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-surface lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-medium lg:hidden">Admin</p>
          <div className="ml-auto flex items-center gap-1.5">
            <Link
              href="/admin/notifications"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-surface hover:text-fg"
              aria-label={unread ? `${unread} unread notifications` : "Notifications"}
            >
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger ring-2 ring-bg" />}
            </Link>
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main id="main" className="px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-bg p-4 shadow-2xl">
            <div className="flex items-center justify-between px-2 py-2">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-surface" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav aria-label="Admin" className="mt-6">
              {links}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="mt-1.5 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
