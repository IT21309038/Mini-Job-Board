import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import PageContainer from "@/components/PageContainer";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const hideHeader = router.pathname === "/login" || router.pathname === "/register";

  return (
    <AuthProvider>
      {!hideHeader && <Header />}
      <ProtectedRoute>
        <PageContainer>
          <Component {...pageProps} />
        </PageContainer>
      </ProtectedRoute>
    </AuthProvider>
  );
}