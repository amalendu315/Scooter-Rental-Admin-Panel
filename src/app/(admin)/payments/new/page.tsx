import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { PaymentForm } from '@/components/forms/PaymentForm';

export default function NewPaymentPage() {
    return (
        <div className="space-y-6">
            <PageHeader title="New Payment" description="Record a new payment for a rental." />
            <Card>
                <CardContent className="pt-6">
                    <PaymentForm />
                </CardContent>
            </Card>
        </div>
    );
}
