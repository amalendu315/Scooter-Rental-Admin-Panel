import { PageHeader } from '@/components/PageHeader';
import { RentalWizard } from '@/components/forms/RentalWizard';

export default function NewRentalPage() {
    return (
        <div className="space-y-6">
            <PageHeader title="Create a New Rental" />
            <RentalWizard />
        </div>
    );
}
