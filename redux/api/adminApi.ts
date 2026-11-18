import { baseApi } from "./baseApi";
import type { ApiMessage, AppNotification, Layout, MonthCount, PageImage, PageSlug, SitePage } from "@/lib/types";

type LayoutType = Layout["type"];

export type LayoutPayload =
  | { type: "Banner"; image?: string; title: string; subTitle: string }
  | { type: "FAQ"; faq: { question: string; answer: string }[] }
  | { type: "Categories"; categories: { title: string }[] };

/** An image is kept as stored ({ public_id, url }), replaced (data URL) or removed (null). */
export type PageImageInput = PageImage | string | null;

export interface PagePayload {
  title: string;
  subtitle: string;
  heroImage: PageImageInput;
  highlights: { value: string; label: string }[];
  sections: { heading: string; body: string; image: PageImageInput }[];
  cta: { text: string; href: string };
  showContact: boolean;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ---------- Layout (public read) ----------
    getLayout: build.query<{ layout: Layout | null }, LayoutType>({
      query: (type) => `/get-layout/${type}`,
      providesTags: (_r, _e, type) => [{ type: "Layout", id: type }],
    }),

    saveLayout: build.mutation<ApiMessage & { layout: Layout }, LayoutPayload & { exists: boolean }>({
      query: ({ exists, ...body }) =>
        exists
          ? { url: `/edit-layout/${body.type}`, method: "PUT", body }
          : { url: "/create-layout", method: "POST", body },
      invalidatesTags: (_r, _e, arg) => [{ type: "Layout", id: arg.type }],
    }),

    // ---------- Content pages (About, Terms, Privacy, Refund) ----------
    getPage: build.query<{ page: SitePage | null }, PageSlug>({
      query: (slug) => `/page/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: "Page", id: slug }],
    }),

    savePage: build.mutation<ApiMessage & { page: SitePage }, { slug: PageSlug; page: PagePayload }>({
      query: ({ slug, page }) => ({ url: `/page/${slug}`, method: "PUT", body: page }),
      invalidatesTags: (_r, _e, arg) => [{ type: "Page", id: arg.slug }],
    }),

    // ---------- Analytics ----------
    getUsersAnalytics: build.query<{ totalUsers: number; analytics: MonthCount[] }, void>({
      query: () => "/get-users-analytics",
      providesTags: ["Analytics"],
    }),
    getOrdersAnalytics: build.query<{ totalOrders: number; analytics: MonthCount[] }, void>({
      query: () => "/get-orders-analytics",
      providesTags: ["Analytics"],
    }),
    getCoursesAnalytics: build.query<{ totalCourses: number; analytics: MonthCount[] }, void>({
      query: () => "/get-courses-analytics",
      providesTags: ["Analytics"],
    }),

    // ---------- Notifications ----------
    getNotifications: build.query<{ notifications: AppNotification[]; unreadCount: number }, void>({
      query: () => "/notification/get-notifications",
      providesTags: ["Notifications"],
    }),

    toggleNotification: build.mutation<ApiMessage & { notification: AppNotification }, string>({
      query: (id) => ({ url: `/notification/update-notification/${id}`, method: "PUT" }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // Optimistic: flip the status straight away.
        const patch = dispatch(
          adminApi.util.updateQueryData("getNotifications", undefined, (draft) => {
            const item = draft.notifications.find((n) => n._id === id);
            if (item) {
              item.status = item.status === "read" ? "unread" : "read";
              draft.unreadCount = draft.notifications.filter((n) => n.status === "unread").length;
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetLayoutQuery,
  useSaveLayoutMutation,
  useGetPageQuery,
  useSavePageMutation,
  useGetUsersAnalyticsQuery,
  useGetOrdersAnalyticsQuery,
  useGetCoursesAnalyticsQuery,
  useGetNotificationsQuery,
  useToggleNotificationMutation,
} = adminApi;
