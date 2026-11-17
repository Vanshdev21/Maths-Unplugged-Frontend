"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BookOpen, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/misc";
import { useLogoutMutation } from "@/redux/api/authApi";
import { signOutOfGoogle } from "@/components/auth/google-button";
import { useAuth } from "@/redux/hooks";

export function UserMenu() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const onLogout = async () => {
    setOpen(false);
    await logout().unwrap().catch(() => undefined);
    signOutOfGoogle();
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  };

  const item = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-surface";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center rounded-full ring-offset-2 ring-offset-bg transition hover:ring-2 hover:ring-border"
      >
        <Avatar name={user.name} src={user.avatar?.url} size={36} />
        <span className="sr-only">Open account menu</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border bg-bg p-2 shadow-xl shadow-black/5"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <Link role="menuitem" href="/my-courses" className={item} onClick={() => setOpen(false)}>
            <BookOpen className="h-4 w-4 text-muted" /> My courses
          </Link>
          <Link role="menuitem" href="/profile" className={item} onClick={() => setOpen(false)}>
            <UserRound className="h-4 w-4 text-muted" /> Profile
          </Link>
          {isAdmin && (
            <Link role="menuitem" href="/admin" className={item} onClick={() => setOpen(false)}>
              <LayoutDashboard className="h-4 w-4 text-muted" /> Admin dashboard
            </Link>
          )}
          <div className="my-1 h-px bg-border" />
          <button role="menuitem" type="button" onClick={onLogout} className={`${item} w-full text-left`}>
            <LogOut className="h-4 w-4 text-muted" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
