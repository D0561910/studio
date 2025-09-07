'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/header';
import { Dashboard } from '@/components/dashboard';

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen">
        <Header />
        <Dashboard />
      </SidebarInset>
    </SidebarProvider>
  );
}
