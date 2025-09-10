'use client';

import { SidebarTrigger } from './ui/sidebar';
import { TransactionDialog } from './transaction-dialog';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { getAuth, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';


export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toast } = useToast();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Success', description: 'Logged out successfully.'});
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to log out.'});
    }
  };

  let title = 'Dashboard';
  if (pathname === '/spending-distribution') {
    title = 'Spending Distribution';
  } else if (pathname === '/category-distribution') {
    title = 'Category Distribution';
  } else if (pathname === '/income-expense-distribution') {
    title = 'Income vs. Expense Distribution';
  }


  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        
          <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
        
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <TransactionDialog>
            <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Transaction</span>
            </Button>
        </TransactionDialog>
        {user && (
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        )}
      </div>
    </header>
  );
}
