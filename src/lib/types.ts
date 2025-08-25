
export type ID = string;
export type Currency = 'INR';
export type Role = 'ADMIN' | 'STAFF';

export interface Rider {
    id: ID;
    fullName: string;
    phone: string;
    email?: string;
    city?: string;
    address?: string;
    idProofType: 'Aadhaar' | 'DL' | 'Passport';
    idProofNumber: string;
    documentExpiryDate: string; // ISO
    photoUrl?: string;
    status: 'active' | 'blocked';
    rentalsCount: number;
    totalSpent: number;
    createdAt?: string;
    updatedAt?: string;
    kycDocuments?: Array<{ name: string; url: string; }>;
}

export interface Vehicle {
    id: ID;
    code: string;
    make: string;
    model: string;
    color: string;
    registrationNumber: string;
    batteryHealth: number; // 0-100
    lastServiceDate: string; // ISO
    available: boolean;
    isServiceDue: boolean;
    currentRentalId?: ID;
    createdAt?: string;
    updatedAt?: string;
}

export type RentalStatus = 'ongoing' | 'completed' | 'overdue' | 'cancelled';
export type Plan = 'daily' | 'weekly';

export interface Rental {
    id: ID;
    riderId: ID;
    vehicleId: ID;
    plan: Plan;
    startDate: string;
    expectedReturnDate: string;
    actualReturnDate?: string | null;
    status: RentalStatus;
    payableTotal: number;
    paidTotal: number;
    balanceDue: number;
    createdAt?: string;
    updatedAt?: string;
    // Denormalized for convenience
    rider: Rider;
    vehicle: Vehicle;
}

export type PayMethod = 'cash' | 'upi' | 'card' | 'bank' | 'online';

export interface Payment {
    id: ID;
    rentalId: ID;
    riderId: ID;
    amount: number;
    method: PayMethod;
    txnRef?: string;
    transactionDate: string;
    createdAt?: string;
    updatedAt?: string;
    // Denormalized for convenience
    rider: Rider;
    rental: Rental;
}

export interface Alert {
    id: ID;
    type: 'Payment Due' | 'Document Expiry' | 'Overdue Rental';
    relatedId: string;
    message: string;
    dueDate: string;
    status: 'read' | 'unread';
    createdAt?: string;
    updatedAt?: string;
}

export interface User {
    id: ID;
    email: string;
    name: string;
    role: Role;
}

export interface Staff {
    id: ID;
    email: string;
    displayName: string;
    role: Role;
    lastLogin: string;
    status: 'active' | 'disabled';
    createdAt?: string;
    updatedAt?: string;
}

export interface Settings {
    companyName: string;
    currency: Currency;
    graceDays: number;
    dailyRateDefault: number;
    weeklyRateDefault: number;
    lateFeeEnabled: boolean;
    lateFeePerDay: number;
}

export interface Paginated<T> {
    rows: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ListParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    q?: string;
    filters?: Record<string, any>;
}
