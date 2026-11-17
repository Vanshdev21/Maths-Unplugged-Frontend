import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { PAYMENTS_ENABLED } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      updated="13 November 2026"
      sections={[
        {
          heading: "Your account",
          body: [
            "You need an account to enrol in a course. Keep your password private; you're responsible for activity on your account.",
            "One account is for one learner. Sharing logins or course videos with others isn't allowed and may lead to the account being suspended.",
          ],
        },
        {
          heading: "Course access",
          body: [
            "When you enrol, you get personal, non-transferable access to the course for as long as it's offered on Maths Unplugged.",
            "Lessons, notes and other materials remain the property of Maths Unplugged. Don't download, copy or redistribute them.",
          ],
        },
        ...(PAYMENTS_ENABLED
          ? [
        {
          heading: "Payments",
          body: [
            "Prices are shown in Indian Rupees and include applicable taxes unless stated otherwise. Payments are processed by Razorpay.",
            "See the refund policy for when you can ask for your money back.",
          ],
        },
            ]
          : [
              {
                heading: "Free courses",
                body: ["Courses are currently free to enrol in. If we introduce paid courses later, we'll show the price clearly before you enrol."],
              },
            ]),
        {
          heading: "Community",
          body: [
            "Be respectful in questions and reviews. We may remove content that is abusive, off-topic or shares answers to assessments.",
          ],
        },
      ]}
    />
  );
}
