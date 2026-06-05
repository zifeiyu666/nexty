export default function AILayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
