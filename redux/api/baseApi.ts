import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/lib/site";
import { sessionExpired } from "../features/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
});

// One refresh request at a time, shared by every query that got a 401.
let refreshing: Promise<boolean> | null = null;

const NO_REFRESH = ["/user/refresh", "/user/loginUser", "/user/logoutUser", "/user/register", "/user/activateUser"];

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === "string" ? args : args.url;

  if (result.error?.status === 401 && !NO_REFRESH.some((path) => url.startsWith(path))) {
    if (!refreshing) {
      refreshing = Promise.resolve(rawBaseQuery("/user/refresh", api, extraOptions))
        .then((res) => !res.error)
        .finally(() => {
          refreshing = null;
        });
    }

    const refreshed = await refreshing;

    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(sessionExpired());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Me",
    "Courses",
    "Course",
    "MyCourses",
    "Content",
    "Progress",
    "AdminCourses",
    "Users",
    "Orders",
    "Notifications",
    "Layout",
    "Page",
    "Analytics",
  ],
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
