'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Bot, RefreshCw, Trash2, Download } from 'lucide-react';
import * as mockApi from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';

export function DevTools() {
    const { toast } = useToast();

    const handleAction = (action: () => any, successMessage: string) => {
        try {
            action();
            toast({ title: 'Success', description: successMessage, variant: 'default' });
            // A full page reload is the easiest way to reflect db changes everywhere
            window.location.reload();
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
    };

    const handleDownload = () => {
        const json = mockApi.getDbAsJson();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'zapgo-mock-db.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: 'Success', description: 'DB snapshot downloaded.', variant: 'default' });
    }

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full h-12 w-12 shadow-lg">
                        <Bot className="h-6 w-6" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Mock API DevTools</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAction(mockApi.runDailyScheduler, 'Daily scheduler has been run.')}>
                        <Bot className="mr-2" /> Run Scheduler
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction(mockApi.reseedDb, 'Database has been re-seeded.')}>
                        <RefreshCw className="mr-2" /> Re-seed Database
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownload}>
                        <Download className="mr-2" /> Dump DB to JSON
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleAction(mockApi.clearDb, 'Database has been cleared.')}
                    >
                        <Trash2 className="mr-2" /> Clear DB (Fresh Start)
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
