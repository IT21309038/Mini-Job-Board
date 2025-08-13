type Props = {
  title: string;
  message?: string;
  action?: React.ReactNode;
};
export default function EmptyState({ title, message, action }: Props) {
  return (
    <div className="mt-6 rounded-md border p-6 text-center">
      <h3 className="text-base font-medium">{title}</h3>
      {message && <p className="mt-1 text-sm text-gray-600">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
