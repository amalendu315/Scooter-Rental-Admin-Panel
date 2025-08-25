'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const login = useAuthStore((state) => state.login);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { email: 'admin@zapgo.com', password: 'password' },
    });

    const onSubmit = (data: any) => {
        if (data.email === 'admin@zapgo.com' && data.password === 'password') {
            login({ id: 's1', name: 'Super Admin', email: 'admin@zapgo.com', role: 'ADMIN' }, 'fake-jwt-token-admin');
            toast({ title: 'Login Successful', description: 'Welcome back, Admin!', variant: 'default' });
            router.push('/dashboard');
        } else if (data.email === 'staff@zapgo.com' && data.password === 'password') {
            login({ id: 's2', name: 'Rajesh Kumar', email: 'staff@zapgo.com', role: 'STAFF' }, 'fake-jwt-token-staff');
            toast({ title: 'Login Successful', description: 'Welcome back, Rajesh!', variant: 'default' });
            router.push('/dashboard');
        } else {
            toast({
                title: 'Login Failed',
                description: 'Invalid email or password. Please try again.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="mx-auto max-w-sm w-full rounded-2xl shadow-xl">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-8 w-8 text-primary"
                        >
                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                            <path d="M5 3v4" />
                            <path d="M19 17v4" />
                            <path d="M3 5h4" />
                            <path d="M17 19h4" />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-headline">ZapGo Admin Login</CardTitle>
                    <CardDescription>Enter your credentials to access the dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                {...register('email', { required: 'Email is required' })}
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password', { required: 'Password is required' })}
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
