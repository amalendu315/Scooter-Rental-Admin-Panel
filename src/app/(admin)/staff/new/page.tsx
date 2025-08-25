import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { StaffForm } from '@/components/forms/StaffForm';

export default function NewStaffPage() {
    return (
        <div className="space-y-6">
            <PageHeader title="Add New Staff Member" description="Create a new user account with a specific role." />
            <Card>
                <CardContent className="pt-6">
                    <StaffForm />
                </CardContent>
            </Card>
        </div>
    );
}
