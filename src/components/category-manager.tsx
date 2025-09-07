'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, LayoutGrid } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/app-context';
import { Icons, getIcon } from '@/components/icons';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  icon: z.string().min(1, 'Please select an icon.'),
});

type CategoryFormValues = z.infer<typeof formSchema>;

export function CategoryManager() {
  const { categories, addCategory, deleteCategory, transactions } = useAppContext();
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', icon: '' },
  });

  const onSubmit = (data: CategoryFormValues) => {
    if (categories.some(c => c.name.toLowerCase() === data.name.toLowerCase())) {
        form.setError('name', { type: 'manual', message: 'Category name must be unique.' });
        return;
    }
    addCategory(data);
    form.reset();
    toast({ title: 'Success', description: 'Category added successfully.' });
  };
  
  const handleDelete = (id: string) => {
    const categoryInUse = transactions.some(t => t.category === categories.find(c => c.id === id)?.name);
    if(categoryInUse) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Cannot delete category as it is currently used in transactions."
        });
        return;
    }
    deleteCategory(id);
    toast({ title: 'Success', description: 'Category deleted.' });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <LayoutGrid className="mr-2 h-4 w-4" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>Add, edit, or delete your expense and income categories.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Existing Categories</h3>
          <ScrollArea className="h-[150px] rounded-md border p-2">
            <div className="space-y-2">
              {categories.map(cat => {
                const Icon = getIcon(cat.icon);
                return (
                  <div key={cat.id} className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <span>{cat.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <h3 className="text-sm font-medium text-muted-foreground">Add New Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-start">
                <div className="sm:col-span-3">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="sr-only">Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Category name" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="sm:col-span-2">
                    <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                        <FormItem>
                         <FormLabel className="sr-only">Icon</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select icon" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {Object.keys(Icons).map(iconKey => {
                                const IconComponent = Icons[iconKey];
                                return (
                                <SelectItem key={iconKey} value={iconKey}>
                                    <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    <span>{iconKey.charAt(0).toUpperCase() + iconKey.slice(1)}</span>
                                    </div>
                                </SelectItem>
                                );
                            })}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>
            <Button type="submit" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </form>
        </Form>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
