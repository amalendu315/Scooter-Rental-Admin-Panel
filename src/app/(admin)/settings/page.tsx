import { PageHeader } from '@/components/PageHeader';
import { SettingsForm } from '@/components/forms/SettingsForm';
import { useAuthStore } from '@/store/auth';
import { redirect } from 'next/navigation';

export default function SettingsPage() {
    const user = useAuthStore.getState().user;
    if(user?.role !== 'ADMIN'){
        // In a real app with server-side auth, this would be handled in middleware or layout
        // For this client-side store approach, this is a safeguard
        console.warn("Unauthorized access attempt to settings page.");
        redirect('/dashboard');
    }
    return (
        <div className="space-y-6">
            <PageHeader title="Settings" description="Manage your application settings and preferences (Admin only)." />
            <SettingsForm />
        </div>
    );
}
