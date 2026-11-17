import { baseApi } from "./baseApi";
import type { ApiMessage, Course, CourseComment, CourseContent, Review } from "@/lib/types";

export type CoursePayload = Omit<Partial<Course>, "thumbnail" | "_id"> & {
  thumbnail?: string;
};

export const courseApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCourses: build.query<{ courses: Course[] }, void>({
      query: () => "/course/get-courses",
      providesTags: ["Courses"],
    }),

    getCourse: build.query<{ course: Course }, string>({
      query: (id) => `/course/get-course/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Course", id }],
    }),

    getMyCourses: build.query<{ courses: Course[] }, void>({
      query: () => "/course/get-user-courses",
      providesTags: ["MyCourses"],
    }),

    getCourseContent: build.query<{ course: CourseContent }, string>({
      query: (id) => `/course/get-course-content/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Content", id }],
    }),

    addQuestion: build.mutation<ApiMessage & { questions: CourseComment[] }, { question: string; courseId: string; contentId: string }>({
      query: (body) => ({ url: "/course/add-question", method: "POST", body }),
      invalidatesTags: (_r, _e, arg) => [{ type: "Content", id: arg.courseId }],
    }),

    addReply: build.mutation<ApiMessage, { reply: string; courseId: string; contentId: string; questionId: string }>({
      query: (body) => ({ url: "/course/add-reply", method: "POST", body }),
      invalidatesTags: (_r, _e, arg) => [{ type: "Content", id: arg.courseId }],
    }),

    addReview: build.mutation<ApiMessage & { course: Course }, { courseId: string; review: string; rating: number }>({
      query: ({ courseId, ...body }) => ({ url: `/course/add-review/${courseId}`, method: "POST", body }),
      invalidatesTags: (_r, _e, arg) => [{ type: "Course", id: arg.courseId }, "Courses", "AdminCourses"],
    }),

    addReviewReply: build.mutation<ApiMessage & { review: Review }, { courseId: string; reviewId: string; reply: string }>({
      query: (body) => ({ url: "/course/add-review-reply", method: "POST", body }),
      invalidatesTags: (_r, _e, arg) => [{ type: "Course", id: arg.courseId }, "AdminCourses"],
    }),

    // ---------- Admin ----------
    getAdminCourses: build.query<{ courses: Course[] }, void>({
      query: () => "/course/get-all-courses",
      providesTags: ["AdminCourses"],
    }),

    getAdminCourse: build.query<{ course: Course }, string>({
      query: (id) => `/course/admin/get-course/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Course", id }],
    }),

    createCourse: build.mutation<ApiMessage & { course: Course }, CoursePayload>({
      query: (body) => ({ url: "/course/uploadCourse", method: "POST", body }),
      invalidatesTags: ["AdminCourses", "Courses", "Analytics"],
    }),

    editCourse: build.mutation<ApiMessage & { course: Course }, { id: string; data: CoursePayload }>({
      query: ({ id, data }) => ({ url: `/course/editCourse/${id}`, method: "PATCH", body: data }),
      invalidatesTags: (_r, _e, arg) => [
        "AdminCourses",
        "Courses",
        "MyCourses",
        { type: "Course", id: arg.id },
        { type: "Content", id: arg.id },
      ],
    }),

    deleteCourse: build.mutation<ApiMessage, string>({
      query: (id) => ({ url: `/course/delete-course/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminCourses", "Courses", "MyCourses", "Orders", "Analytics"],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useGetMyCoursesQuery,
  useGetCourseContentQuery,
  useAddQuestionMutation,
  useAddReplyMutation,
  useAddReviewMutation,
  useAddReviewReplyMutation,
  useGetAdminCoursesQuery,
  useGetAdminCourseQuery,
  useCreateCourseMutation,
  useEditCourseMutation,
  useDeleteCourseMutation,
} = courseApi;
