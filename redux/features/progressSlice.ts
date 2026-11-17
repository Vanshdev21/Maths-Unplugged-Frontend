import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * Lesson completion is tracked on this device (the backend has no
 * progress endpoint). Keyed by `${userId}:${courseId}`.
 */
interface ProgressState {
  completed: Record<string, string[]>;
  lastLesson: Record<string, string>;
}

const initialState: ProgressState = { completed: {}, lastLesson: {} };

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    hydrateProgress(_state, action: PayloadAction<ProgressState>) {
      return {
        completed: action.payload.completed ?? {},
        lastLesson: action.payload.lastLesson ?? {},
      };
    },
    toggleLesson(state, action: PayloadAction<{ key: string; lessonId: string; done?: boolean }>) {
      const { key, lessonId, done } = action.payload;
      const list = new Set(state.completed[key] ?? []);
      const shouldComplete = done ?? !list.has(lessonId);
      if (shouldComplete) list.add(lessonId);
      else list.delete(lessonId);
      state.completed[key] = [...list];
    },
    setLastLesson(state, action: PayloadAction<{ key: string; lessonId: string }>) {
      state.lastLesson[action.payload.key] = action.payload.lessonId;
    },
  },
});

export const { hydrateProgress, toggleLesson, setLastLesson } = progressSlice.actions;
export type { ProgressState };
export default progressSlice.reducer;
