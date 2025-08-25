import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/PageHeader';
import { mockVehicles } from '@/lib/data';
import { formatIST } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function VehiclesPage() {
    return (
        <>
            <PageHeader title="Vehicles" description="Manage your fleet of vehicles.">
                <Button asChild><Link href="/vehicles/new"><PlusCircle className="mr-2 h-4 w-4" /> Add New Vehicle</Link></Button>
            </PageHeader>
            <Card>
                <CardContent>
                    <div className="py-4">
                        <Input placeholder="Search by code or registration..."/>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Make & Model</TableHead>
                                <TableHead>Registration</TableHead>
                                <TableHead>Battery %</TableHead>
                                <TableHead>Last Service</TableHead>
                                <TableHead>Available</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockVehicles.map((vehicle) => (
                                <TableRow key={vehicle.id}>
                                    <TableCell className="font-medium">{vehicle.code}</TableCell>
                                    <TableCell>{vehicle.make} {vehicle.model}</TableCell>
                                    <TableCell>{vehicle.registrationNumber}</TableCell>
                                    <TableCell>{vehicle.batteryHealth}%</TableCell>
                                    <TableCell>{formatIST(vehicle.lastServiceDate, 'dd MMM yyyy')}</TableCell>
                                    <TableCell>
                                        <Badge variant={vehicle.available ? 'default' : 'secondary'}>
                                            {vehicle.available ? 'Yes' : 'No'}
                                        </Badge>
                                        {vehicle.isServiceDue && <Badge variant="destructive" className="ml-2">Service Due</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/vehicles/${vehicle.id}`}>View Details</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
