
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { mockVehicles, mockRentals } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { VehicleForm } from '@/components/forms/VehicleForm';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import * as mockApi from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import type { Vehicle } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        mockApi.getVehicle(params.id).then(v => {
            if (v) setVehicle(v)
            else notFound();
        })
    }, [params.id]);


    if (!vehicle) {
        return <div>Loading...</div>; // Or a skeleton loader
    }

    const isRented = !!vehicle.currentRentalId;

    const handleAvailabilityToggle = async (checked: boolean) => {
        try {
            await mockApi.updateVehicle(params.id, { available: checked });
            setVehicle(v => v ? {...v, available: checked} : null);
            toast({ title: 'Success', description: 'Vehicle availability updated.'});
        } catch(e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader title={`${vehicle.make} ${vehicle.model}`} description={`Manage details for vehicle ${vehicle.code}.`}>
                <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Vehicles</Button>
            </PageHeader>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Vehicle</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <VehicleForm vehicle={vehicle} />
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Availability</CardTitle>
                            <CardDescription>Toggle vehicle availability for new rentals.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="availability-toggle"
                                    checked={vehicle.available}
                                    onCheckedChange={handleAvailabilityToggle}
                                    disabled={isRented}
                                />
                                <Label htmlFor="availability-toggle">{vehicle.available ? 'Available' : 'Unavailable'}</Label>
                            </div>
                            {isRented && <p className="text-sm text-destructive mt-2">Cannot change availability while rental is ongoing.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
