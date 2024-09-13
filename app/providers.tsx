"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";

import "react-toastify/dist/ReactToastify.css";
import { store } from "@/state";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <SessionProvider>
      <Provider store={store}>
        <NextUIProvider navigate={router.push}>
          <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
        </NextUIProvider>
        <ToastContainer
          closeOnClick
          draggable
          hideProgressBar
          newestOnTop
          pauseOnHover
          autoClose={1500}
          pauseOnFocusLoss={false}
          position="bottom-center"
          rtl={false}
          theme="dark"
        />
      </Provider>
    </SessionProvider>
  );
}
