import type { Order } from "@/lib/types";

export const orderUser = (o: Order) => (o.userId && typeof o.userId === "object" ? o.userId : null);
export const orderCourse = (o: Order) => (o.courseId && typeof o.courseId === "object" ? o.courseId : null);
export const orderAmount = (o: Order) => Number(o.payment_info?.amount ?? 0) || 0;
