"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { makeStore } from "@/redux/store";
import { useMigrateLocalProgress } from "@/hooks/use-progress";
import { useLoadUserQuery } from "@/redux/api/authApi";

function SessionBootstrap() {
  // Loads the signed-in user (if any) once for the whole app.
  useLoadUserQuery();
  useMigrateLocalProgress();
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
