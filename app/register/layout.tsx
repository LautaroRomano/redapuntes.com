export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 ">
      <div className="inline-block w-full max-w-3xl text-center justify-center">
        {children}
      </div>
    </section>
  );
}
