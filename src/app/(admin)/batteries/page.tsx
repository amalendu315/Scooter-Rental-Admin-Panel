
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/PageHeader';
import { formatIST } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { FileDown, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import * as mockApi from '@/lib/mockApi';
import type { BatteryPack } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export default function BatteriesPage() {
    const [packs, setPacks] = useState<BatteryPack[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get('filters.status');

    useEffect(() => {
        setLoading(true);
        const filters = statusFilter ? { status: statusFilter } : {};
        mockApi.listBatteryPacks({ q: search, filters })
            .then(data => {
                setPacks(data.rows);
                setLoading(false);
            });
    }, [search, statusFilter]);

    return (
        <>
            <PageHeader title="Battery Packs" description="Manage your swappable battery inventory.">
                <Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> Export CSV</Button>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Battery</Button>
            </PageHeader>
            <Card>
                <CardContent>
                    <div className="py-4">
                        <Input
                            placeholder="Search by serial number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Serial #</TableHead>
                                <TableHead>Health</TableHead>
                                <TableHead>Charge</TableHead>
                                <TableHead>Cycles</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned Vehicle</TableHead>
                                <TableHead>Last Swap</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                                ))
                            ) : packs.length > 0 ? packs.map((pack) => (
                                <TableRow key={pack.id}>
                                    <TableCell className="font-medium">{pack.serialNumber}</TableCell>
                                    <TableCell>{pack.healthPercent}%</TableCell>
                                    <TableCell>{pack.chargePercent}%</TableCell>
                                    <TableCell>{pack.cycleCount}</TableCell>
                                    <TableCell><Badge variant="secondary">{pack.status.replace('_', ' ')}</Badge></TableCell>
                                    <TableCell>{pack.assignedVehicleId || 'N/A'}</TableCell>
                                    <TableCell>{pack.lastSwapAt ? formatIST(pack.lastSwapAt, 'dd MMM yy') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={8} className="text-center">No battery packs found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
