import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="mx-auto mt-20 max-w-md text-center">
      <h1 className="text-2xl font-semibold">Unauthorized</h1>
      <p className="mt-2 text-gray-600">You don’t have permission to view this page.</p>
      <Link href="/" className="mt-6 inline-block rounded-md border px-4 py-2 text-sm">Go home</Link>
    </div>
  );
}
