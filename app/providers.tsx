"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { makeStore, PROGRESS_STORAGE_KEY } from "@/redux/store";
import { hydrateProgress } from "@/redux/features/progressSlice";
import { useLoadUserQuery } from "@/redux/api/authApi";

function SessionBootstrap() {
  // Loads the signed-in user (if any) once for the whole app.
  useLoadUserQuery();
  return null;
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        classNames: {
          toast: "!rounded-xl !border-border !font-sans",
        },
      }}
    />
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  // One store per browser session (and per request on the server).
  const [store] = useState(makeStore);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (saved) store.dispatch(hydrateProgress(JSON.parse(saved)));
    } catch {
      // Ignore corrupted progress data.
    }
  }, [store]);

  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SessionBootstrap />
        {children}
        <ThemedToaster />
      </ThemeProvider>
    </Provider>
  );
}
