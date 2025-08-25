import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockPayments } from '@/lib/data';
import { formatINR, formatIST } from '@/lib/format';

export function RecentActivity() {
    const recentPayments = mockPayments.slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {recentPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://i.pravatar.cc/40?u=${payment.rider.id}`} alt="Avatar" />
                                <AvatarFallback>{payment.rider.fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{payment.rider.fullName}</p>
                                <p className="text-sm text-muted-foreground">
                                    Paid for Rental #{payment.rentalId} via {payment.method}
                                </p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="font-medium font-code">{formatINR(payment.amount)}</p>
                                <p className='text-sm text-muted-foreground'>{formatIST(payment.transactionDate, 'dd MMM')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
