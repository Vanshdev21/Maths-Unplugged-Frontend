"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useCreateOrderMutation, useCreatePaymentMutation, useLazyGetRazorpayKeyQuery, type RazorpaySuccess } from "@/redux/api/orderApi";
import { getErrorMessage } from "@/lib/utils";
import { site } from "@/lib/site";
import type { User } from "@/lib/types";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  image?: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void; confirm_close?: boolean };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", cb: (res: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise: Promise<boolean> | null = null;

function loadScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (!scriptPromise) {
    scriptPromise = new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        scriptPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

/**
 * Enrols the user in a course. Free courses enrol directly; paid ones open
 * Razorpay checkout and the server verifies the payment before enrolling.
 */
export function useEnroll() {
  const [getKey] = useLazyGetRazorpayKeyQuery();
  const [createPayment] = useCreatePaymentMutation();
  const [createOrder] = useCreateOrderMutation();
  const [busy, setBusy] = useState(false);

  const enroll = useCallback(
    async (course: { _id: string; name: string; price: number }, user: User, onSuccess?: () => void) => {
      setBusy(true);
      try {
        if (!course.price || course.price <= 0) {
          await createOrder({ courseId: course._id }).unwrap();
          toast.success("You're enrolled. Enjoy the course!");
          onSuccess?.();
          setBusy(false);
          return;
        }

        const [loaded, keyRes, payment] = await Promise.all([
          loadScript(),
          getKey(undefined, true).unwrap(),
          createPayment({ courseId: course._id }).unwrap(),
        ]);

        if (!loaded || !window.Razorpay) {
          throw new Error("Payment window couldn't load. Check your connection or disable ad blockers, then try again.");
        }

        const checkout = new window.Razorpay({
          key: keyRes.key,
          amount: payment.order.amount,
          currency: payment.order.currency,
          name: site.name,
          description: course.name,
          order_id: payment.order.id,
          image: `${window.location.origin}/logo.svg`,
          prefill: { name: user.name, email: user.email },
          theme: { color: "#FDE700" },
          handler: async (response) => {
            const toastId = toast.loading("Confirming your payment…");
            try {
              await createOrder({ courseId: course._id, payment_info: response }).unwrap();
              toast.success("Payment confirmed. You're enrolled!", { id: toastId });
              onSuccess?.();
            } catch (err) {
              toast.error(
                `${getErrorMessage(err)} If money was deducted, email ${site.supportEmail} with payment ID ${response.razorpay_payment_id}.`,
                { id: toastId, duration: 15000 },
              );
            } finally {
              setBusy(false);
            }
          },
          modal: {
            ondismiss: () => setBusy(false),
          },
        });

        checkout.on("payment.failed", (res) => {
          toast.error(res.error?.description ?? "Payment failed. No money was taken. Try again.");
        });

        checkout.open();
      } catch (err) {
        toast.error(getErrorMessage(err));
        setBusy(false);
      }
    },
    [createOrder, createPayment, getKey],
  );

  return { enroll, busy };
}
