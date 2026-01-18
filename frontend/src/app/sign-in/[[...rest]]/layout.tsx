export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-white to-[#e0f2fe]">
      {children}
    </div>
  );
}
