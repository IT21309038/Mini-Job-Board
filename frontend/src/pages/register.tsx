import { useState, FormEvent } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import authAPIs from "@/api/authAPIs";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate" as "candidate" | "employer",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authAPIs.register(form);
      const login = await authAPIs.login({
        email: form.email,
        password: form.password,
      });
      const payload = login.data?.data ?? login.data;
      const token = payload?.access_token ?? payload?.token;
      const user = payload?.user ?? payload?.data?.user ?? payload?.data;

      if (token && user?.id) {
        Cookies.set("token", token, { sameSite: "lax" });
        await refreshUser();
        router.replace(
          user.role === "employer" ? "/employer/dashboard" : "/jobs"
        );
        return;
      }
      router.replace("/login?justRegistered=1");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-md">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm">Name</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm">Role</label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.role}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e) => setForm({ ...form, role: e.target.value as any })}
          >
            <option value="candidate">Candidate</option>
            <option value="employer">Employer</option>
          </select>
        </div>
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <button
          disabled={busy}
          className="w-full rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create account"}
        </button>
        <div className="pt-2 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </div>
      </form>
    </div>
  );
}
