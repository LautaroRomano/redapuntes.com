export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      className="flex flex-col items-center justify-start gap-4 overflow-y-auto"
      style={{ height: "calc(100vh - 60px)" }}
    >
      <div className="flex text-center justify-center w-full">{children}</div>
    </section>
  );
}
