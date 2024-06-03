export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 md:py-10">
      <div className="flex text-center justify-center w-full">{children}</div>
    </section>
  );
}
