import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/misc";
import { PAYMENTS_ENABLED, site } from "@/lib/site";

const groups = [
  {
    title: "Learn",
    links: [
      { href: "/courses", label: "All courses" },
      { href: "/my-courses", label: "My courses" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Create account" },
      { href: "/profile", label: "Profile" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/about", label: "About us" },
      { href: "/terms", label: "Terms of use" },
      { href: "/privacy", label: "Privacy policy" },
      ...(PAYMENTS_ENABLED ? [{ href: "/refund-policy", label: "Refund policy" }] : []),
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">{site.description}</p>
          <a href={`mailto:${site.supportEmail}`} className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline">
            {site.supportEmail}
          </a>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="font-sans text-sm font-semibold">{g.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted transition hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="flex flex-col gap-2 border-t border-border py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        {PAYMENTS_ENABLED && <p>Payments are processed securely by Razorpay.</p>}
      </Container>
    </footer>
  );
}
