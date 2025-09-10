'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/header';
import { Dashboard } from '@/components/dashboard';

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
            <Dashboard />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
