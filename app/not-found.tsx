import Link from "next/link";
import { Header } from "@/components/layout/header";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="bg-graph flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-5 text-center">
        <p className="font-display text-8xl font-bold tabular">404</p>
        <h1 className="mt-4 text-3xl font-bold">This page doesn&apos;t exist</h1>
        <p className="mt-3 max-w-md text-muted">The link may be broken or the page may have moved.</p>
        <div className="mt-8 flex gap-3">
          <ButtonLink href="/">Go home</ButtonLink>
          <ButtonLink href="/courses" variant="outline">
            Browse courses
          </ButtonLink>
        </div>
        <Link href="mailto:support@mathsunplugged.com" className="mt-8 text-sm text-muted underline underline-offset-4">
          Report a broken link
        </Link>
      </main>
    </>
  );
}
