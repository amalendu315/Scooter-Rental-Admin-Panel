
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { VehicleSchema } from '@/lib/schemas';
import type { Vehicle } from '@/lib/types';
import * as mockApi from '@/lib/mockApi';

type VehicleFormValues = z.infer<typeof VehicleSchema>;

interface VehicleFormProps {
    vehicle?: Vehicle;
}

export function VehicleForm({ vehicle }: VehicleFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const isEditMode = !!vehicle;

    const defaultValues: Partial<VehicleFormValues> = vehicle
        ? { ...vehicle, lastServiceDate: new Date(vehicle.lastServiceDate).toISOString().split('T')[0] }
        : {
            code: '',
            make: '',
            model: '',
            color: '',
            registrationNumber: '',
            batteryHealth: 100,
            lastServiceDate: new Date().toISOString().split('T')[0],
        };

    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(VehicleSchema),
        defaultValues,
    });

    async function onSubmit(data: VehicleFormValues) {
        try {
            if (isEditMode && vehicle) {
                await mockApi.updateVehicle(vehicle.id, data);
            } else {
                await mockApi.createVehicle(data as any);
            }
            toast({
                title: isEditMode ? 'Vehicle Updated' : 'Vehicle Created',
                description: `Vehicle ${data.code} has been successfully ${isEditMode ? 'updated' : 'created'}.`,
                variant: 'default',
            });
            if (isEditMode) {
                router.refresh();
            } else {
                router.push('/vehicles');
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
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vehicle Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., ZG-001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="registrationNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Registration Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., MH01AB1234" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="make"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Make</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Ola" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., S1 Pro" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Color</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Midnight Blue" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="batteryHealth"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Battery Health (%)</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" max="100" placeholder="e.g., 98" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastServiceDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Service Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Vehicle'}</Button>
                </div>
            </form>
        </Form>
    );
}
