"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useMemo } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const homeHref = useMemo(() => {
    if (!user) return "/login";
    return user.role === "employer" ? "/employer/dashboard" : "/jobs";
  }, [user]);

  const nav = useMemo(() => {
    if (!user) return null;
    if (user.role === "employer") {
      return (
        <nav className="flex items-center gap-3">
          <a href="/employer/dashboard" className="text-sm hover:underline">
            Dashboard
          </a>
        </nav>
      );
    }
    return (
      <nav className="flex items-center gap-3">
        <a href="/jobs" className="text-sm hover:underline">
          Jobs
        </a>
        <a href="/candidate/applications" className="text-sm hover:underline">
          My Applications
        </a>
      </nav>
    );
  }, [user]);

  const refresh = () => {
    // simple, reliable page refresh
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <a href={homeHref} className="text-xl font-semibold">
          Mini Job Board
        </a>

        <div className="flex items-center gap-4">
          {nav}
          <div className="hidden h-5 w-px bg-gray-200 md:block" />
          {user ? (
            <>
              <span className="hidden text-sm text-gray-600 md:inline">
                Hi, {user.name}
              </span>
              <button
                onClick={refresh}
                className="rounded-md border px-3 py-1.5 text-sm cursor-pointer"
                aria-label="Refresh"
              >
                Refresh
              </button>
                <button
                onClick={logout}
                className="rounded-md border px-3 py-1.5 text-sm cursor-pointer"
                aria-label="Logout"
                >
                Logout
                </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="rounded-md border px-3 py-1.5 text-sm"
              >
                Login
              </a>
              <a
                href="/register"
                className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
              >
                Sign up
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
