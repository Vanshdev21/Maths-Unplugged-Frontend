import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/lib/types";

export type AuthStatus = "loading" | "authenticated" | "guest";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  /** Set after registration; needed to verify the emailed code. */
  activation: { token: string; email: string } | null;
}

const initialState: AuthState = {
  user: null,
  status: "loading",
  activation: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = { ...state.user, ...action.payload };
      state.status = "authenticated";
    },
    clearUser(state) {
      state.user = null;
      state.status = "guest";
    },
    sessionExpired(state) {
      state.user = null;
      state.status = "guest";
    },
    setActivation(state, action: PayloadAction<AuthState["activation"]>) {
      state.activation = action.payload;
    },
  },
});

export const { setUser, clearUser, sessionExpired, setActivation } = authSlice.actions;
export default authSlice.reducer;
