
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SettingsSchema } from '@/lib/schemas';
import type { Settings } from '@/lib/types';
import * as mockApi from '@/lib/mockApi';
import { useEffect } from 'react';

type SettingsFormValues = z.infer<typeof SettingsSchema>;

export function SettingsForm() {
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(SettingsSchema),
    });

    useEffect(() => {
        mockApi.getSettings().then(settings => {
            form.reset(settings);
        });
    }, [form]);

    async function onSubmit(data: SettingsFormValues) {
        try {
            await mockApi.updateSettings(data);
            toast({
                title: 'Settings Updated',
                description: 'Application settings have been successfully saved.',
                variant: 'default',
            });
            router.refresh();
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive'});
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                        <CardDescription>Update your company's details and contact info for NOCs.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField control={form.control} name="companyName" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="Your Company Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormItem><FormLabel>Currency</FormLabel><FormControl><Input value="INR (₹)" readOnly disabled /></FormControl><FormDescription>Currency is set to INR and cannot be changed.</FormDescription></FormItem>
                        </div>
                        {/*<FormField control={form.control} name="contactAddress" render={({ field }) => (<FormItem><FormLabel>Company Address</FormLabel><FormControl><Textarea placeholder="Company Address for NOC" {...field} /></FormControl><FormMessage /></FormItem>)} />*/}
                        {/*<div className="grid grid-cols-1 gap-4 md:grid-cols-2">*/}
                        {/*    <FormField control={form.control} name="contactPhone" render={({ field }) => (<FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="Company Phone for NOC" {...field} /></FormControl><FormMessage /></FormItem>)} />*/}
                        {/*    <FormField control={form.control} name="contactEmail" render={({ field }) => (<FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" placeholder="Company Email for NOC" {...field} /></FormControl><FormMessage /></FormItem>)} />*/}
                        {/*</div>*/}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Rental & Fee Settings</CardTitle>
                        <CardDescription>Manage default rates and late fee policies.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField control={form.control} name="dailyRateDefault" render={({ field }) => ( <FormItem><FormLabel>Default Daily Rate (₹)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="weeklyRateDefault" render={({ field }) => ( <FormItem><FormLabel>Default Weekly Rate (₹)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )} />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField control={form.control} name="lateFeePerDay" render={({ field }) => ( <FormItem><FormLabel>Late Fee Per Day (₹)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="graceDays" render={({ field }) => ( <FormItem><FormLabel>Grace Days for Return</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField control={form.control} name="taxPercentDefault" render={({ field }) => ( <FormItem><FormLabel>Default Tax %</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/></FormControl><FormMessage /></FormItem> )} />
                        </div>
                        <FormField control={form.control} name="lateFeeEnabled" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"> <div className="space-y-0.5"> <FormLabel>Enable Late Fees</FormLabel> <FormDescription> Automatically apply late fees for overdue rentals. </FormDescription> </div> <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl> </FormItem> )} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>No Objection Certificate (NOC)</CardTitle></CardHeader>
                    <CardContent>
                        <FormField control={form.control} name="nocTemplate" render={({ field }) => ( <FormItem><FormLabel>NOC Template</FormLabel><FormControl><Textarea rows={10} {...field} /></FormControl><FormDescription> Available placeholders: {`{{companyName}}`}, {`{{riderName}}`}, {`{{riderId}}`}, {`{{vehicleCode}}`}, {`{{registrationNumber}}`}, {`{{rentalId}}`}, {`{{startDate}}`}, {`{{actualReturnDate}}`}, {`{{finalAmount}}`}, {`{{generatedAt}}`} </FormDescription><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Battery Thresholds</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormField control={form.control} name="batteryHealthThresholdWarn" render={({ field }) => ( <FormItem><FormLabel>Health Warning %</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="batteryHealthThresholdCrit" render={({ field }) => ( <FormItem><FormLabel>Health Critical %</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="batteryChargeThresholdWarn" render={({ field }) => ( <FormItem><FormLabel>Charge Warning %</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl></FormItem> )} />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button type="submit">Save Settings</Button>
                </div>
            </form>
        </Form>
    );
}
