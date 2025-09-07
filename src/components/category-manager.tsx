'use client';

import React, { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Category } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  icon: z.string().min(1, 'Please select an icon.'),
  type: z.enum(['income', 'expense']),
});

type CategoryFormValues = z.infer<typeof formSchema>;

const CategoryList = ({ categories, handleDelete, isDefaultCategory }: { categories: Category[], handleDelete: (id: string) => void, isDefaultCategory: (cat: Category) => boolean }) => (
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
                {!isDefaultCategory(cat) && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(cat.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>
            );
        })}
        </div>
    </ScrollArea>
);


export function CategoryManager() {
  const { incomeCategories, expenseCategories, addCategory, deleteCategory, defaultCategories } = useAppContext();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', icon: '', type: 'expense' },
  });

  const onSubmit = (data: CategoryFormValues) => {
    addCategory(data);
    form.reset({ ...form.getValues(), name: '', icon: '' });
  };
  
  const handleDelete = (id: string) => {
    deleteCategory(id);
  }
  
  const isDefaultCategory = (category: Category) => {
    return defaultCategories.some(dc => dc.name === category.name && dc.type === category.type);
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

        <Tabs defaultValue="expense" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
          <TabsContent value="expense">
             <CategoryList categories={expenseCategories} handleDelete={handleDelete} isDefaultCategory={isDefaultCategory} />
          </TabsContent>
          <TabsContent value="income">
             <CategoryList categories={incomeCategories} handleDelete={handleDelete} isDefaultCategory={isDefaultCategory} />
          </TabsContent>
        </Tabs>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <h3 className="text-sm font-medium text-muted-foreground">Add New Category</h3>
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Category Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select icon" />
                            </Trigger>
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
