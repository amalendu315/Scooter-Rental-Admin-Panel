import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { RiderForm } from '@/components/forms/RiderForm';

export default function NewRiderPage() {
    return (
        <div className="space-y-6">
            <PageHeader title="Add New Rider" description="Fill in the details to create a new rider profile." />
            <Card>
                <CardContent className="pt-6">
                    <RiderForm />
                </CardContent>
            </Card>
        </div>
    );
}
