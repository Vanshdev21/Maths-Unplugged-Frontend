import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PAYMENTS_ENABLED } from "@/lib/site";
import { PolicyPage } from "@/components/content/content-page";
import { fetchPage } from "@/lib/server-api";
import { pageOrDefault } from "@/lib/page-defaults";

// Edited in Admin → Pages. Saving refreshes this page straight away.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = pageOrDefault("refund-policy", await fetchPage("refund-policy"));
  return { title: page.title, ...(page.subtitle ? { description: page.subtitle } : {}) };
}

export default async function RefundPage() {
  if (!PAYMENTS_ENABLED) notFound();
  const page = pageOrDefault("refund-policy", await fetchPage("refund-policy"));
  return <PolicyPage page={page} />;
}
