import { DollarSign, Bike, Clock, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { EarningsChart } from '@/components/charts/EarningsChart';
import { VehicleUtilizationChart } from '@/components/charts/VehicleUtilizationChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { formatINR } from '@/lib/format';

export default function DashboardPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <PageHeader title="Dashboard" description="Here's a snapshot of your business today." />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Today's Earnings"
                    value={formatINR(45231)}
                    icon={<DollarSign className="h-5 w-5" />}
                    comparison="+20.1% from yesterday"
                    comparisonColor="green"
                />
                <StatCard
                    title="Vehicles Available"
                    value="15 / 20"
                    icon={<Bike className="h-5 w-5" />}
                    comparison="-2 since last hour"
                    comparisonColor="red"
                />
                <StatCard
                    title="Ongoing Rentals"
                    value="5"
                    icon={<Clock className="h-5 w-5" />}
                    comparison="+3 from yesterday"
                    comparisonColor="green"
                />
                <StatCard
                    title="Overdue Rentals"
                    value="1"
                    icon={<AlertTriangle className="h-5 w-5" />}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4">
                    <EarningsChart />
                </div>
                <div className="lg:col-span-3">
                    <RecentActivity />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                <VehicleUtilizationChart />
            </div>
        </div>
    );
}
