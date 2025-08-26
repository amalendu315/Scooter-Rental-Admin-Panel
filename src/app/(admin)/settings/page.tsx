
'use client';

import { PageHeader } from '@/components/PageHeader';
import { SettingsForm } from '@/components/forms/SettingsForm';
import { useAuthStore } from '@/store/auth';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
    const { user, isLoading } = useAuthStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (isLoading || !isClient) {
        return <div>Loading...</div>; // Or a skeleton loader
    }

    if(user?.role !== 'ADMIN'){
        redirect('/dashboard');
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Settings" description="Manage your application settings and preferences (Admin only)." />
            <SettingsForm />
        </div>
    );
}
