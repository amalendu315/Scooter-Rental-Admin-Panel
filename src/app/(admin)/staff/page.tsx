import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/PageHeader';
import { mockStaff } from '@/lib/data';
import { formatIST } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { redirect } from 'next/navigation';


export default function StaffPage() {
    const user = useAuthStore.getState().user;
    if (user?.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    return (
        <>
            <PageHeader title="Staff Management" description="Manage staff accounts and permissions (Admin only).">
                <Button asChild><Link href="/staff/new"><PlusCircle className="mr-2 h-4 w-4" /> Add New Staff</Link></Button>
            </PageHeader>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Display Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockStaff.map((staff) => (
                                <TableRow key={staff.id}>
                                    <TableCell className="font-medium">{staff.displayName}</TableCell>
                                    <TableCell>{staff.email}</TableCell>
                                    <TableCell><Badge variant="outline">{staff.role}</Badge></TableCell>
                                    <TableCell>{formatIST(staff.lastLogin)}</TableCell>
                                    <TableCell>
                                        <Badge variant={staff.status === 'active' ? 'default' : 'destructive'}>
                                            {staff.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/staff/${staff.id}`}>Edit</Link>
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
