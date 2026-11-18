"use client";

import { useState } from "react";
import { PageHeader } from "@/components/admin/admin-shell";
import { PageEditor } from "@/components/admin/page-editor";
import { Tabs } from "@/components/ui/tabs";
import { PAGE_LABELS } from "@/lib/page-defaults";
import type { PageSlug } from "@/lib/types";

const SLUGS: PageSlug[] = ["about", "terms", "privacy", "refund-policy"];

export default function AdminPagesPage() {
  const [slug, setSlug] = useState<PageSlug>("about");
  return (
    <>
      <PageHeader title="Pages" description="Edit the About page and your policies. Changes go live as soon as you save." />
      <Tabs label="Pages" value={slug} onChange={setSlug} items={SLUGS.map((s) => ({ value: s, label: PAGE_LABELS[s] }))} />
      <div className="pt-8">
        <PageEditor key={slug} slug={slug} />
      </div>
    </>
  );
}
