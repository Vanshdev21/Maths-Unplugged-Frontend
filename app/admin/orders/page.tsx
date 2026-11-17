"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { PageHeader } from "@/components/admin/admin-shell";
import { orderAmount, orderCourse, orderUser } from "@/components/admin/order-helpers";
import { Table, TableSkeleton, Td, Th } from "@/components/admin/table";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { Badge, EmptyState } from "@/components/ui/misc";
import { useGetAllOrdersQuery } from "@/redux/api/orderApi";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

function toCsv(orders: Order[]) {
  const rows = [["Date", "Learner", "Email", "Course", "Amount (INR)", "Method", "Payment ID"]];
  for (const o of orders) {
    rows.push([
      new Date(o.createdAt).toISOString(),
      orderUser(o)?.name ?? "",
      orderUser(o)?.email ?? "",
      orderCourse(o)?.name ?? "",
      String(orderAmount(o)),
      o.payment_info?.method ?? "",
      o.payment_info?.payment_id ?? "",
    ]);
  }
  return rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
}

export default function AdminOrdersPage() {
  const { data, isLoading } = useGetAllOrdersQuery();
  const [q, setQ] = useState("");

  const orders = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data?.orders ?? []).filter((o) => {
      if (!term) return true;
      return [orderUser(o)?.name, orderUser(o)?.email, orderCourse(o)?.name, o.payment_info?.payment_id]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [data, q]);

  const revenue = orders.reduce((s, o) => s + orderAmount(o), 0);

  const download = () => {
    const blob = new Blob([toCsv(orders)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Orders"
        description={data ? `${orders.length} orders, ${formatPrice(revenue) === "Free" ? "₹0" : formatPrice(revenue)} collected` : undefined}
        action={
          <Button variant="outline" size="sm" onClick={download} disabled={!orders.length}>
            <Download className="h-4 w-4" aria-hidden /> Export CSV
          </Button>
        }
      />

      <label className="relative mb-5 block">
        <span className="sr-only">Search orders</span>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by learner, course or payment ID" className={cn(inputClass, "h-11 pl-10")} />
      </label>

      {isLoading ? (
        <TableSkeleton />
      ) : !orders.length ? (
        <EmptyState title="No orders yet" description="Orders appear here as soon as someone enrols." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Learner</Th>
              <Th>Course</Th>
              <Th>Amount</Th>
              <Th>Payment</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-surface/60">
                <Td>
                  <p className="font-medium">{orderUser(o)?.name ?? "Deleted user"}</p>
                  <p className="text-xs text-muted">{orderUser(o)?.email}</p>
                </Td>
                <Td className="max-w-[16rem] truncate">{orderCourse(o)?.name ?? "Deleted course"}</Td>
                <Td className="font-medium tabular">{orderAmount(o) ? formatPrice(orderAmount(o)) : "Free"}</Td>
                <Td>
                  <Badge tone={o.payment_info?.method === "razorpay" ? "success" : "neutral"}>
                    {o.payment_info?.method === "razorpay" ? "Razorpay" : "Free enrolment"}
                  </Badge>
                  {o.payment_info?.payment_id && <p className="mt-1 font-mono text-xs text-muted">{o.payment_info.payment_id}</p>}
                </Td>
                <Td className="whitespace-nowrap text-muted">{formatDate(o.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
