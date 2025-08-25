
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
import { RiderSchema } from '@/lib/schemas';
import type { Rider } from '@/lib/types';
import * as mockApi from '@/lib/mockApi';

type RiderFormValues = z.infer<typeof RiderSchema>;

interface RiderFormProps {
    rider?: Rider;
    onSuccess?: () => void;
}

export function RiderForm({ rider, onSuccess }: RiderFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const isEditMode = !!rider;

    const defaultValues: Partial<RiderFormValues> = rider
        ? { ...rider, documentExpiryDate: rider.documentExpiryDate ? rider.documentExpiryDate.split('T')[0] : '' }
        : {
            fullName: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            idProofType: 'Aadhaar',
            idProofNumber: '',
            documentExpiryDate: '',
            status: 'active',
        };

    const form = useForm<RiderFormValues>({
        resolver: zodResolver(RiderSchema),
        defaultValues,
    });

    async function onSubmit(data: RiderFormValues) {
        try {
            if (isEditMode) {
                await mockApi.updateRider(rider.id, data);
            } else {
                await mockApi.createRider(data as any);
            }
            toast({
                title: isEditMode ? 'Rider Updated' : 'Rider Created',
                description: `${data.fullName}'s profile has been successfully ${isEditMode ? 'updated' : 'created'}.`,
                variant: 'default',
            });
            if (onSuccess) {
                onSuccess();
            } else if (isEditMode) {
                router.refresh();
            } else {
                router.push('/riders');
            }
        } catch(e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive'});
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter full name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter 10-digit phone number" {...field} />
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
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter full address" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter city" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="idProofType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID Proof Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ID proof type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Aadhaar">Aadhaar Card</SelectItem>
                                        <SelectItem value="DL">Driving License</SelectItem>
                                        <SelectItem value="Passport">Passport</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="idProofNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID Proof Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter ID proof number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="documentExpiryDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Document Expiry Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="blocked">Blocked</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => (onSuccess ? onSuccess() : router.back())}>Cancel</Button>
                    <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Rider'}</Button>
                </div>
            </form>
        </Form>
    );
}
