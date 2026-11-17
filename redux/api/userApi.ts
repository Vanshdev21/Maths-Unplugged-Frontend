import { baseApi } from "./baseApi";
import { setUser } from "../features/authSlice";
import type { ApiMessage, Role, User } from "@/lib/types";

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateUserInfo: build.mutation<
      ApiMessage & { user: User; emailChangePending: { email: string; resendAvailableIn: number } | null },
      { name?: string; email?: string }
    >({
      query: (body) => ({ url: "/user/updateUserInfo", method: "PATCH", body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser({ ...data.user, id: data.user._id ?? data.user.id }));
        } catch {
          /* handled by the form */
        }
      },
      invalidatesTags: ["Me"],
    }),

    confirmEmailChange: build.mutation<ApiMessage & { user: User }, { code: string }>({
      query: (body) => ({ url: "/user/confirm-email-change", method: "POST", body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser({ ...data.user, id: data.user._id ?? data.user.id }));
        } catch {
          /* handled by the form */
        }
      },
      invalidatesTags: ["Me", "Users"],
    }),

    updatePassword: build.mutation<ApiMessage, { oldPassword: string; newPassword: string }>({
      query: (body) => ({ url: "/user/updateUserPassword", method: "PATCH", body }),
    }),

    updateAvatar: build.mutation<ApiMessage & { user: User }, { avatar: string }>({
      query: (body) => ({ url: "/user/updateProfilePicture", method: "PATCH", body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser({ ...data.user, id: data.user._id ?? data.user.id }));
        } catch {
          /* handled by the form */
        }
      },
      invalidatesTags: ["Me"],
    }),

    // ---------- Admin ----------
    getAllUsers: build.query<{ users: User[] }, void>({
      query: () => "/user/get-all-users",
      providesTags: ["Users"],
    }),

    updateUserRole: build.mutation<ApiMessage, { id: string; role: Role }>({
      query: (body) => ({ url: "/user/update-user-role", method: "PUT", body }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: build.mutation<ApiMessage, string>({
      query: (id) => ({ url: `/user/delete-user/${id}`, method: "DELETE" }),
      invalidatesTags: ["Users", "Orders", "Analytics"],
    }),
  }),
});

export const {
  useUpdateUserInfoMutation,
  useConfirmEmailChangeMutation,
  useUpdatePasswordMutation,
  useUpdateAvatarMutation,
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = userApi;
