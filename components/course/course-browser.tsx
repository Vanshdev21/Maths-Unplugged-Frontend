"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { CourseCard } from "./course-card";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { inputClass, Select } from "@/components/ui/field";
import { cn, splitTags } from "@/lib/utils";
import { LEVELS } from "@/lib/site";
import type { Course } from "@/lib/types";

type Sort = "newest" | "popular" | "rating" | "price-asc" | "price-desc";

interface Props {
  courses: Course[];
  categories: string[];
  initial: { q?: string; category?: string; level?: string; sort?: string };
}

export function CourseBrowser({ courses, categories, initial }: Props) {
  const [q, setQ] = useState(initial.q ?? "");
  const [category, setCategory] = useState(initial.category ?? "");
  const [level, setLevel] = useState(initial.level ?? "");
  const [sort, setSort] = useState<Sort>((initial.sort as Sort) || "newest");

  // Keep the URL shareable without re-rendering the server page.
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (level) params.set("level", level);
    if (sort !== "newest") params.set("sort", sort);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [q, category, level, sort]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = courses.filter((c) => {
      if (level && c.level?.toLowerCase() !== level.toLowerCase()) return false;
      if (category && !splitTags(c.tags).some((t) => t.toLowerCase() === category.toLowerCase())) return false;
      if (term) {
        const haystack = `${c.name} ${c.description} ${c.tags}`.toLowerCase();
        if (!term.split(/\s+/).every((word) => haystack.includes(word))) return false;
      }
      return true;
    });
    const sorted = [...list];
    switch (sort) {
      case "popular":
        sorted.sort((a, b) => (b.purchased ?? 0) - (a.purchased ?? 0));
        break;
      case "rating":
        sorted.sort((a, b) => (b.ratings ?? 0) - (a.ratings ?? 0));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      default:
        sorted.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    }
    return sorted;
  }, [courses, q, category, level, sort]);

  const hasFilters = !!(q || category || level);
  const clear = () => {
    setQ("");
    setCategory("");
    setLevel("");
  };

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search courses</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by topic, e.g. trigonometry"
            className={cn(inputClass, "h-11 pl-10")}
          />
        </label>
        <div className="grid grid-cols-2 gap-3 md:flex">
          <Select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level" className="md:w-40">
            <option value="">All levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort by" className="md:w-44">
            <option value="newest">Newest</option>
            <option value="popular">Most enrolled</option>
            <option value="rating">Highest rated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </Select>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="scrollbar-thin -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Categories">
          {["", ...categories].map((c) => (
            <button
              key={c || "all"}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm transition",
                category === c ? "border-fg bg-fg text-bg" : "border-border text-muted hover:border-fg/40 hover:text-fg",
              )}
            >
              {c || "All"}
            </button>
          ))}
        </div>
      )}

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {results.length} {results.length === 1 ? "course" : "courses"}
        {hasFilters && " match your filters"}
      </p>

      {results.length ? (
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((course, i) => (
            <CourseCard key={course._id} course={course} priority={i < 3} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-5"
          icon={<Search className="h-5 w-5" />}
          title="No courses match"
          description="Try a broader search term or remove a filter."
          action={
            hasFilters ? (
              <Button variant="outline" onClick={clear}>
                <X className="h-4 w-4" /> Clear filters
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
