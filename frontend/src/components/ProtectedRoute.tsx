"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

const publicRoutes = ["/", "/login", "/register"];

const routeRoleMap: Record<string, "employer" | "candidate"> = {
  "/employer": "employer",
  "/candidate": "candidate",
};

const roleHome = (role: "employer" | "candidate") =>
  role === "employer" ? "/employer/dashboard" : "/jobs";

export default function ProtectedRoute({
  children,
}: {
  readonly children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = router.pathname; // e.g. "/employer/dashboard" or "/candidate/applications"
  const asPath = router.asPath; // preserves query/params for redirect back

  useEffect(() => {
    const isPublic = publicRoutes.includes(path);
    const requiredRole = Object.entries(routeRoleMap).find(([prefix]) =>
      path.startsWith(prefix)
    )?.[1];

    if (loading) return;

    // Not logged in → block non-public routes
    if (!user) {
      if (!isPublic) {
        router.replace(`/login?redirect=${encodeURIComponent(asPath)}`);
      }
      return;
    }

    // Logged in → bounce away from public entry pages
    if (path === "/" || path === "/login" || path === "/register") {
      router.replace(roleHome(user.role));
      return;
    }

    // Role-protected sections
    if (requiredRole && user.role !== requiredRole) {
      router.replace("/401");
      return;
    }
  }, [loading, user, path, asPath, router]);

  // Loading or blocking (unauth + non-public) → spinner
  if (loading || (!user && !publicRoutes.includes(path))) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  return <>{children}</>;
}