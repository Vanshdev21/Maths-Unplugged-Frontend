"use client";

import Link from "next/link";
import { BookOpen, IndianRupee, ReceiptIndianRupee, Users } from "lucide-react";
import { PageHeader } from "@/components/admin/admin-shell";
import { MonthlyChart } from "@/components/admin/monthly-chart";
import { orderAmount, orderCourse, orderUser } from "@/components/admin/order-helpers";
import { Badge, Skeleton } from "@/components/ui/misc";
import { useGetCoursesAnalyticsQuery, useGetOrdersAnalyticsQuery, useGetUsersAnalyticsQuery } from "@/redux/api/adminApi";
import { useGetAllOrdersQuery } from "@/redux/api/orderApi";
import { useAuth } from "@/redux/hooks";
import { formatPrice, timeAgo } from "@/lib/utils";

function Stat({ label, value, icon: Icon, loading }: { label: string; value: string; icon: typeof Users; loading?: boolean }) {
  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between text-sm text-muted">
        {label}
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      {loading ? <Skeleton className="mt-3 h-8 w-24" /> : <p className="mt-2 text-3xl font-bold tabular">{value}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const users = useGetUsersAnalyticsQuery();
  const orders = useGetOrdersAnalyticsQuery();
  const courses = useGetCoursesAnalyticsQuery();
  const allOrders = useGetAllOrdersQuery();

  const revenue = allOrders.data?.orders.reduce((s, o) => s + orderAmount(o), 0) ?? 0;
  const recent = allOrders.data?.orders.slice(0, 6) ?? [];

  return (
    <>
      <PageHeader title={`Hello, ${user?.name.split(" ")[0] ?? "admin"}`} description="Here's how Maths Unplugged is doing." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Learners" icon={Users} value={(users.data?.totalUsers ?? 0).toLocaleString("en-IN")} loading={users.isLoading} />
        <Stat label="Courses" icon={BookOpen} value={(courses.data?.totalCourses ?? 0).toLocaleString("en-IN")} loading={courses.isLoading} />
        <Stat label="Enrolments" icon={ReceiptIndianRupee} value={(orders.data?.totalOrders ?? 0).toLocaleString("en-IN")} loading={orders.isLoading} />
        <Stat label="Revenue" icon={IndianRupee} value={revenue ? formatPrice(revenue) : "₹0"} loading={allOrders.isLoading} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <MonthlyChart title="New learners per month" unit="learners" total={users.data?.totalUsers} data={users.data?.analytics} loading={users.isLoading} />
        <MonthlyChart title="Enrolments per month" unit="enrolments" total={orders.data?.totalOrders} data={orders.data?.analytics} loading={orders.isLoading} />
      </div>

      <section className="mt-6 rounded-2xl border border-border">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-sans text-base font-semibold">Latest enrolments</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-muted hover:text-fg">
            View all
          </Link>
        </div>
        {allOrders.isLoading ? (
          <div className="space-y-3 px-5 pb-5">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : recent.length ? (
          <ul className="divide-y divide-border border-t border-border">
            {recent.map((o) => (
              <li key={o._id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{orderUser(o)?.name ?? "Deleted user"}</span>
                  <span className="text-muted"> enrolled in </span>
                  <span className="font-medium">{orderCourse(o)?.name ?? "Deleted course"}</span>
                </span>
                <Badge tone={orderAmount(o) ? "success" : "neutral"}>{orderAmount(o) ? formatPrice(orderAmount(o)) : "Free"}</Badge>
                <span className="w-24 text-right text-muted">{timeAgo(o.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-t border-border px-5 py-8 text-center text-sm text-muted">No enrolments yet.</p>
        )}
      </section>
    </>
  );
}
