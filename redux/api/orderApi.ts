import { baseApi } from "./baseApi";
import type { ApiMessage, Order } from "@/lib/types";

export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRazorpayKey: build.query<{ key: string }, void>({
      query: () => "/order/payment/razorpay-key",
    }),

    createPayment: build.mutation<
      { order: { id: string; amount: number; currency: string }; course: { _id: string; name: string } },
      { courseId: string }
    >({
      query: (body) => ({ url: "/order/payment/create", method: "POST", body }),
    }),

    createOrder: build.mutation<ApiMessage & { order: Order }, { courseId: string; payment_info?: RazorpaySuccess }>({
      query: (body) => ({ url: "/order/create-order", method: "POST", body }),
      invalidatesTags: (_r, _e, arg) => [
        "Me",
        "MyCourses",
        "Courses",
        "Orders",
        "Analytics",
        { type: "Course", id: arg.courseId },
      ],
    }),

    getAllOrders: build.query<{ orders: Order[] }, void>({
      query: () => "/order/get-all-orders",
      providesTags: ["Orders"],
    }),
  }),
});

export const {
  useLazyGetRazorpayKeyQuery,
  useCreatePaymentMutation,
  useCreateOrderMutation,
  useGetAllOrdersQuery,
} = orderApi;
