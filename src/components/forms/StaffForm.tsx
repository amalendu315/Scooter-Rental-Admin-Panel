
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { StaffSchema } from '@/lib/schemas';
import type { Staff } from '@/lib/types';
import * as mockApi from '@/lib/mockApi';

const formSchema = StaffSchema.extend({
    password: StaffSchema.shape.password.optional(),
});

type StaffFormValues = z.infer<typeof formSchema>;

interface StaffFormProps {
    staff?: Staff;
}

export function StaffForm({ staff }: StaffFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const isEditMode = !!staff;

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: isEditMode
            ? { ...staff }
            : {
                displayName: '',
                email: '',
                role: 'STAFF',
                password: '',
                status: 'active',
                permissions: []
            },
    });

    async function onSubmit(data: StaffFormValues) {
        try {
            if (isEditMode && staff) {
                await mockApi.updateUser(staff.id, data as Staff);
            } else {
                await mockApi.createStaff(data as any);
            }
            toast({
                title: isEditMode ? 'Staff Updated' : 'Staff Member Created',
                description: `${data.displayName}'s profile has been successfully ${isEditMode ? 'updated' : 'created'}.`,
                variant: 'default',
            });
            if (isEditMode) {
                router.refresh();
            } else {
                router.push('/staff');
            }
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Display Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter display name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="Enter email address" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="STAFF">Staff</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {!isEditMode && (
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter initial password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Staff Member'}</Button>
                </div>
            </form>
        </Form>
    );
}
