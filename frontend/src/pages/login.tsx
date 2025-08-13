import { useState, FormEvent, useMemo } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import authAPIs from "@/api/authAPIs";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const banner = useMemo(() => {
    if (router.query.expired) return "Session expired. Please sign in again.";
    if (router.query.justRegistered) return "Account created. Please sign in.";
    return null;
  }, [router.query.expired, router.query.justRegistered]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      // 1) Login against Laravel API
      const res = await authAPIs.login({ email, password });

      // Support common API shapes:
      const payload = res.data?.data ?? res.data;
      const token =
        payload?.access_token ?? payload?.token ?? payload?.data?.access_token;

      const user = payload?.user ?? payload?.data?.user ?? payload?.data;

      if (!token || !user?.id || !user?.role) {
        throw new Error("Unexpected login response");
      }

      // 2) Store token for apiPrivate interceptor
      Cookies.set("token", token, { sameSite: "lax" });

      // 3) Refresh context user
      await refreshUser();

      // 4) Compute safe redirect per role
      const roleHome =
        user.role === "employer" ? "/employer/dashboard" : "/jobs";
      let redirect = (router.query.redirect as string) || roleHome;

      if (user.role === "candidate") {
        // Only allow /candidate/* or default to /jobs
        if (!redirect.startsWith("/candidate")) {
          redirect = roleHome; // /jobs
        }
        // Fix stale/unknown candidate dashboards
        if (redirect === "/candidate" || redirect === "/candidate/dashboard") {
          redirect = "/jobs";
        }
      } else if (user.role === "employer") {
        // Only allow /employer/* or default to /employer/dashboard
        if (!redirect.startsWith("/employer")) {
          redirect = roleHome;
        }
      }

      router.replace(redirect);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Invalid email or password."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar (optional brand) */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          Mini Job Board
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-12 sm:pb-16 md:grid-cols-2">
        {/* Left: Welcome / marketing */}
        <div className="order-2 md:order-1">
          <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to <span className="text-gray-900">Job Board</span>
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to post jobs as an employer or apply as a candidate.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-gray-900" />
                Manage job posts and review applications as an employer.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-gray-900" />
                Browse all openings and submit your resume as a candidate.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-gray-900" />
                Simple, fast, and responsive experience powered by Next.js.
              </li>
            </ul>

            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
              Tip: If your session times out, just sign in again—your data is
              safe.
            </div>
          </div>
        </div>

        {/* Right: Auth card */}
        <div className="order-1 md:order-2">
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-700 px-6 py-8 text-white">
              <h2 className="text-xl font-semibold">Sign in</h2>
              <p className="mt-1 text-sm text-gray-200">
                Use your email and password.
              </p>
            </div>

            <div className="px-6 py-6 md:px-8 md:py-8">
              {banner && (
                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {banner}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="email"
                      className="w-full rounded-md border px-3 py-2 pl-10 text-sm outline-none focus:ring"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      placeholder="you@example.com"
                      required
                    />
                    {/* mail icon */}
                    <svg
                      viewBox="0 0 24 24"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                      fill="currentColor"
                    >
                      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.01L12 13 4 6.01V6h16ZM4 18V8.236l7.385 6.32a1 1 0 0 0 1.23 0L20 8.236V18H4Z" />
                    </svg>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showPw ? "text" : "password"}
                      className="w-full rounded-md border px-3 py-2 pr-10 text-sm outline-none focus:ring"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-gray-700"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? (
                        // eye-off
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="currentColor"
                        >
                          <path d="M3.53 2.47a.75.75 0 1 0-1.06 1.06l2.02 2.02C2.54 7.05 1.37 8.78 1 9.34a1 1 0 0 0 0 1.32C2.73 12.67 6.64 17 12 17c2.02 0 3.8-.5 5.32-1.3l3.15 3.15a.75.75 0 1 0 1.06-1.06L3.53 2.47ZM12 15.5c-4.45 0-7.84-3.58-9.33-5.84.4-.6 1.46-2.04 3.2-3.38l2.13 2.13A4.5 4.5 0 0 0 12 16.5c.74 0 1.43-.17 2.05-.47l1.08 1.08c-1 .25-2.05.39-3.13.39Zm0-2a2.5 2.5 0 0 1-2.47-2.9l3.87 3.87c-.44.22-.93.33-1.4.33ZM20.47 9.4c.56.7.9 1.26 1.06 1.5-1.14 1.68-3.9 4.9-7.96 5.5l-1.6-1.6A4.5 4.5 0 0 0 9.2 8.03L7.92 6.75A10.2 10.2 0 0 1 12 5.5c5.36 0 9.27 4.33 11 6.34a1 1 0 0 1 0 1.32 18.1 18.1 0 0 1-1.32 1.44l-1.68-1.68c.84-.82 1.5-1.66 1.98-2.42-.48-.72-1.29-1.74-2.44-2.7a11.6 11.6 0 0 0-3.48-1.98l1.2-1.2c1.4.56 2.73 1.33 3.94 2.3Z" />
                        </svg>
                      ) : (
                        // eye
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="currentColor"
                        >
                          <path d="M12 5.5c5.36 0 9.27 4.33 11 6.34a1 1 0 0 1 0 1.32C21.27 15.67 17.36 20 12 20S2.73 15.67 1 13.16a1 1 0 0 1 0-1.32C2.73 9.83 6.64 5.5 12 5.5Zm0 2C7.55 7.5 4.16 11.08 2.67 13.34 4.16 15.6 7.55 19 12 19s7.84-3.4 9.33-5.66C19.84 11.08 16.45 7.5 12 7.5Zm0 2.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm text-white transition-opacity disabled:opacity-60"
                >
                  {busy ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                      Signing in…
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>

                <div className="pt-2 text-center text-sm">
                  New user?{" "}
                  <a
                    href="/register"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Create an account
                  </a>
                </div>
              </form>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">
            By signing in, you agree to our acceptable use and privacy
            practices.
          </p>
        </div>
      </div>
    </div>
  );
}
