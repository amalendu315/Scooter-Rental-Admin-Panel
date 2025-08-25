
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { mockStaff } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, UserX, UserCheck } from 'lucide-react';
import { StaffForm } from '@/components/forms/StaffForm';
import * as mockApi from '@/lib/mockApi';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';

export default function StaffDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    // In a real app, you'd fetch this data.
    const staffMember = mockStaff.find((s) => s.id === id);
    const router = useRouter();
    const { toast } = useToast();

    if (!staffMember) {
        notFound();
    }

    const isSelf = staffMember.email === 'admin@zapgo.com';

    const handleToggleStatus = async () => {
        try {
            const newStatus = staffMember.status === 'active' ? 'disabled' : 'active';
            await mockApi.updateUser(id, { status: newStatus });
            toast({ title: 'Success', description: `User has been ${newStatus}.`, variant: 'default' });
            router.refresh();
        } catch(e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
    }

    const handleDelete = async () => {
        try {
            await mockApi.deleteUser(id);
            toast({ title: 'Success', description: `User account has been deleted.`, variant: 'default' });
            router.push('/staff');
        } catch(e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader title={staffMember.displayName} description={`Manage ${staffMember.displayName}'s account.`}>
                <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Staff</Button>
            </PageHeader>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Staff Member</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StaffForm staff={staffMember} />
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader><CardTitle>Account Actions</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Button variant="outline" disabled={isSelf} onClick={handleToggleStatus}>
                                {staffMember.status === 'active' ? <UserX className="mr-2 h-4 w-4"/> : <UserCheck className="mr-2 h-4 w-4"/>}
                                {staffMember.status === 'active' ? 'Disable Account' : 'Enable Account'}
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={isSelf}><Trash2 className="mr-2 h-4 w-4"/> Delete Account</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the account for {staffMember.displayName}.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>Yes, delete account</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
