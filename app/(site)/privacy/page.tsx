import type { Metadata } from "next";
import { PolicyPage } from "@/components/content/content-page";
import { fetchPage } from "@/lib/server-api";
import { pageOrDefault } from "@/lib/page-defaults";

// Edited in Admin → Pages. Saving refreshes this page straight away.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = pageOrDefault("privacy", await fetchPage("privacy"));
  return { title: page.title, ...(page.subtitle ? { description: page.subtitle } : {}) };
}

export default async function PrivacyPage() {

  const page = pageOrDefault("privacy", await fetchPage("privacy"));
  return <PolicyPage page={page} />;
}
