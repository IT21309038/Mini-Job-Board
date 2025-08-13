export default function PageContainer({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-6xl p-4">{children}</main>;
}
