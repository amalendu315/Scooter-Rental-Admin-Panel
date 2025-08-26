
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/PageHeader';
import { formatIST } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { FileDown, PlusCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import * as mockApi from '@/lib/mockApi';
import type { BatterySwap } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function BatterySwapsPage() {
    const [swaps, setSwaps] = useState<BatterySwap[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setLoading(true);
        mockApi.listBatterySwaps({ q: search })
            .then(data => {
                setSwaps(data.rows);
                setLoading(false);
            });
    }, [search]);

    return (
        <>
            <PageHeader title="Battery Swaps" description="View history of all battery swaps.">
                <Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> Export CSV</Button>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Record Swap</Button>
            </PageHeader>
            <Card>
                <CardContent>
                    <div className="py-4">
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Swap Date</TableHead>
                                <TableHead>Battery Out</TableHead>
                                <TableHead>Battery In</TableHead>
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Rider</TableHead>
                                <TableHead>SoC Out/In</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                                ))
                            ) : swaps.length > 0 ? swaps.map((swap) => (
                                <TableRow key={swap.id}>
                                    <TableCell>{formatIST(swap.swapAt)}</TableCell>
                                    <TableCell className="font-code text-green-600 flex items-center gap-1">
                                        <ArrowRight size={14}/> {swap.outBatteryId?.substring(0,6) || 'N/A'}
                                    </TableCell>
                                    <TableCell className="font-code text-red-600 flex items-center gap-1">
                                        <ArrowLeft size={14}/> {swap.inBatteryId?.substring(0,6) || 'N/A'}
                                    </TableCell>
                                    <TableCell>{swap.vehicleId?.substring(0,6) || 'N/A'}</TableCell>
                                    <TableCell>{swap.riderId?.substring(0,6) || 'N/A'}</TableCell>
                                    <TableCell>{swap.outSoC}% / {swap.inSoC}%</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={6} className="text-center">No battery swaps found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
