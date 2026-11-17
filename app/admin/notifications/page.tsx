"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { PageHeader } from "@/components/admin/admin-shell";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { useGetNotificationsQuery, useToggleNotificationMutation } from "@/redux/api/adminApi";
import { cn, timeAgo } from "@/lib/utils";

export default function AdminNotificationsPage() {
  const { data, isLoading } = useGetNotificationsQuery(undefined, { pollingInterval: 30_000 });
  const [toggle] = useToggleNotificationMutation();
  const [filter, setFilter] = useState<"unread" | "all">("unread");

  const items = (data?.notifications ?? []).filter((n) => filter === "all" || n.status === "unread");

  return (
    <>
      <PageHeader
        title="Notifications"
        description="New orders, questions and reviews. Read notifications are cleared after 30 days."
        action={
          <div className="flex gap-1 rounded-xl border border-border p-1" role="group" aria-label="Filter notifications">
            {(["unread", "all"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={cn("rounded-lg px-3.5 py-1.5 text-sm", filter === f ? "bg-fg text-bg" : "text-muted hover:text-fg")}
              >
                {f === "unread" ? `Unread (${data?.unreadCount ?? 0})` : "All"}
              </button>
            ))}
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : !items.length ? (
        <EmptyState icon={<Bell className="h-5 w-5" />} title={filter === "unread" ? "You're all caught up" : "No notifications yet"} />
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {items.map((n) => (
            <li key={n._id} className="flex items-start gap-4 px-5 py-4">
              <span className={cn("mt-2 h-2 w-2 shrink-0 rounded-full", n.status === "unread" ? "bg-brand-line" : "bg-transparent")} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", n.status === "unread" ? "font-semibold" : "font-medium text-muted")}>{n.title}</p>
                <p className="mt-0.5 text-sm text-muted">{n.message}</p>
                <p className="mt-1 text-xs text-subtle">{timeAgo(n.createdAt)}</p>
              </div>
              <button type="button" onClick={() => toggle(n._id)} className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:bg-surface hover:text-fg">
                {n.status === "unread" ? "Mark as read" : "Mark as unread"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
