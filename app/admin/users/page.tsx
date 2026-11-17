"use client";

import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/admin-shell";
import { Table, TableSkeleton, Td, Th } from "@/components/admin/table";
import { inputClass } from "@/components/ui/field";
import { ConfirmModal } from "@/components/ui/modal";
import { Avatar, Badge, EmptyState } from "@/components/ui/misc";
import { useDeleteUserMutation, useGetAllUsersQuery, useUpdateUserRoleMutation } from "@/redux/api/userApi";
import { useAuth } from "@/redux/hooks";
import { cn, formatDate, getErrorMessage, getUserId } from "@/lib/utils";
import type { Role, User } from "@/lib/types";

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const { data, isLoading } = useGetAllUsersQuery();
  const [updateRole] = useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"" | Role>("");
  const [target, setTarget] = useState<User | null>(null);

  const users = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data?.users ?? []).filter(
      (u) => (!role || u.role === role) && (!term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)),
    );
  }, [data, q, role]);

  const onRole = async (u: User, next: Role) => {
    try {
      const res = await updateRole({ id: getUserId(u), role: next }).unwrap();
      toast.success(res.message ?? "Role updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onDelete = async () => {
    if (!target) return;
    try {
      await deleteUser(getUserId(target)).unwrap();
      toast.success(`Deleted ${target.name}`);
      setTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <PageHeader title="Users" description={data ? `${data.users.length} registered accounts` : undefined} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search users</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className={cn(inputClass, "h-11 pl-10")} />
        </label>
        <div className="flex gap-1 rounded-xl border border-border p-1" role="group" aria-label="Filter by role">
          {(["", "user", "admin"] as const).map((r) => (
            <button
              key={r || "all"}
              type="button"
              onClick={() => setRole(r)}
              aria-pressed={role === r}
              className={cn("rounded-lg px-3.5 py-1.5 text-sm", role === r ? "bg-fg text-bg" : "text-muted hover:text-fg")}
            >
              {r === "" ? "All" : r === "user" ? "Learners" : "Admins"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : !users.length ? (
        <EmptyState title="No users found" description="Try a different search." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Courses</Th>
              <Th>Joined</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isMe = getUserId(u) === getUserId(me);
              return (
                <tr key={getUserId(u)} className="hover:bg-surface/60">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} src={u.avatar?.url} size={34} />
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-medium">
                          {u.name} {isMe && <Badge>You</Badge>}
                        </p>
                        <p className="truncate text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <select
                      value={u.role}
                      disabled={isMe}
                      onChange={(e) => onRole(u, e.target.value as Role)}
                      aria-label={`Role for ${u.name}`}
                      className="rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm disabled:opacity-60"
                    >
                      <option value="user">Learner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </Td>
                  <Td className="tabular">{u.courses?.length ?? 0}</Td>
                  <Td className="whitespace-nowrap text-muted">{formatDate(u.createdAt)}</Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      onClick={() => setTarget(u)}
                      disabled={isMe}
                      className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-30"
                      aria-label={`Delete ${u.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <ConfirmModal
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Delete this account?"
        description={`${target?.name ?? ""} (${target?.email ?? ""}) will lose access to all their courses and their orders will be deleted. This can't be undone.`}
        confirmLabel="Delete account"
      />
    </>
  );
}
