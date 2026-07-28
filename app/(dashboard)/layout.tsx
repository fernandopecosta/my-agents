import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import { listAllTags } from "@/lib/agents";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tags = await listAllTags();

  return (
    <div className="relative flex min-h-screen flex-col md:flex-row">
      <Sidebar tags={tags} />
      <div className="flex-1 flex flex-col overflow-auto">
        <MobileHeader />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
