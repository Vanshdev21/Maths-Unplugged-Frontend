"use client";

import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/redux/hooks";

export function HeroSecondaryCta() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <ButtonLink href="/my-courses" size="lg" variant="outline">
      Continue learning
    </ButtonLink>
  ) : (
    <ButtonLink href="/signup" size="lg" variant="outline">
      Create free account
    </ButtonLink>
  );
}
