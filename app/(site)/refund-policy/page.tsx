import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Refund policy" };

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund policy"
      updated="13 November 2026"
      sections={[
        {
          heading: "7-day refunds",
          body: [
            "If a course isn't right for you, email us within 7 days of purchase with your registered email and Razorpay payment ID. We'll refund the full amount if you've watched less than 30% of the lessons.",
          ],
        },
        {
          heading: "How refunds are paid",
          body: [
            "Approved refunds go back to the original payment method through Razorpay, usually within 5 to 7 working days. Course access ends once the refund is issued.",
          ],
        },
        {
          heading: "Failed or duplicate payments",
          body: [
            "If money was deducted but the course didn't unlock, or you were charged twice, email us with the payment ID. We'll either unlock the course or refund the payment.",
          ],
        },
      ]}
    />
  );
}
