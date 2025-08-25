
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { mockPayments } from '@/lib/data';
import { formatINR, formatIST } from '@/lib/format';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const payment = mockPayments.find((p) => p.id === id);

    if (!payment) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <PageHeader title={`Payment #${payment.id.substring(0, 7)}...`} description={`Details for payment made on ${formatIST(payment.transactionDate)}.`}>
                <Button variant="outline" asChild>
                    <Link href="/payments"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Payments</Link>
                </Button>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle className="font-code text-3xl">{formatINR(payment.amount)}</CardTitle>
                    <CardDescription>
                        Payment via <Badge variant="secondary">{payment.method.toUpperCase()}</Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <h3 className="text-lg font-semibold">Rider Details</h3>
                            <p>Name: <Link href={`/riders/${payment.riderId}`} className="text-primary hover:underline">{payment.rider.fullName}</Link></p>
                            <p>Phone: {payment.rider.phone}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Rental Details</h3>
                            <p>Rental ID: <Link href={`/rentals/${payment.rentalId}`} className="text-primary hover:underline">#{payment.rentalId.substring(0, 7)}...</Link></p>
                            <p>Period: {formatIST(payment.rental.startDate, 'dd MMM yy')} - {formatIST(payment.rental.expectedReturnDate, 'dd MMM yy')}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Transaction Details</h3>
                            <p>Date: {formatIST(payment.transactionDate)}</p>
                            {payment.txnRef && <p>Reference: {payment.txnRef}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
