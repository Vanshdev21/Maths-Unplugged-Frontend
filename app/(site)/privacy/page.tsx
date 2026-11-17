import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { PAYMENTS_ENABLED } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="13 November 2026"
      sections={[
        {
          heading: "What we collect",
          body: [
            "Your name, email address and password (stored only as a secure hash), your profile picture if you add one, the courses you enrol in, and the questions and reviews you post.",
            ...(PAYMENTS_ENABLED
              ? ["We don't receive or store your card or bank details. Razorpay handles payment information under its own privacy policy."]
              : []),
          ],
        },
        {
          heading: "How we use it",
          body: [
            "To run your account, give you access to courses, send verification codes, enrolment confirmations and replies to your questions, and to improve our courses.",
            "We don't sell your personal data.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "We use essential cookies to keep you logged in. Lesson progress is saved in your browser on this device.",
          ],
        },
        {
          heading: "Your choices",
          body: ["You can update your name, email and picture from your profile. To delete your account, email us and we'll remove it."],
        },
      ]}
    />
  );
}
