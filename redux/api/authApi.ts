import { baseApi } from "./baseApi";
import { clearUser, setActivation, setUser } from "../features/authSlice";
import type { ApiMessage, User } from "@/lib/types";

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody extends LoginBody {
  name: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    loadUser: build.query<{ user: User }, void>({
      query: () => "/user/me",
      providesTags: ["Me"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
        } catch {
          dispatch(clearUser());
        }
      },
    }),

    register: build.mutation<ApiMessage & { activationToken: string; resendAvailableIn?: number }, RegisterBody>({
      query: (body) => ({ url: "/user/register", method: "POST", body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const activation = { token: data.activationToken, email: arg.email };
          dispatch(setActivation(activation));
          try {
            // Survives a page refresh on the verify screen.
            sessionStorage.setItem("mu:activation", JSON.stringify(activation));
          } catch {
            /* storage unavailable */
          }
        } catch {
          /* handled by the form */
        }
      },
    }),

    activate: build.mutation<ApiMessage & { user: User }, { activation_token: string; activation_code: string }>({
      query: (body) => ({ url: "/user/activateUser", method: "POST", body }),
    }),

    resendActivation: build.mutation<ApiMessage & { resendAvailableIn: number }, { activation_token: string }>({
      query: (body) => ({ url: "/user/resend-activation", method: "POST", body }),
    }),

    forgotPassword: build.mutation<ApiMessage & { resendAvailableIn: number }, { email: string }>({
      query: (body) => ({ url: "/user/forgot-password", method: "POST", body }),
    }),

    resetPassword: build.mutation<ApiMessage, { email: string; code: string; newPassword: string }>({
      query: (body) => ({ url: "/user/reset-password", method: "POST", body }),
    }),

    login: build.mutation<ApiMessage & { user: User }, LoginBody>({
      query: (body) => ({ url: "/user/loginUser", method: "POST", body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
          // Fetch the full profile (includes enrolled courses).
          dispatch(baseApi.util.invalidateTags(["Me", "MyCourses", "Progress"]));
        } catch {
          /* handled by the form */
        }
      },
    }),

    googleLogin: build.mutation<ApiMessage & { user: User }, { credential: string }>({
      query: (body) => ({ url: "/user/google", method: "POST", body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
          dispatch(baseApi.util.invalidateTags(["Me", "MyCourses", "Progress"]));
        } catch {
          /* handled by the button */
        }
      },
    }),

    logout: build.mutation<ApiMessage, void>({
      query: () => ({ url: "/user/logoutUser", method: "GET" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearUser());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useLoadUserQuery,
  useRegisterMutation,
  useActivateMutation,
  useResendActivationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLoginMutation,
  useLogoutMutation,
  useGoogleLoginMutation,
} = authApi;
