

export type ID = string;
export type Currency = 'INR';
export type Role = 'ADMIN' | 'STAFF';

export type Permission =
// Riders
    | 'riders:view' | 'riders:create' | 'riders:update' | 'riders:delete'
    // Vehicles
    | 'vehicles:view' | 'vehicles:create' | 'vehicles:update' | 'vehicles:delete'
    // Rentals
    | 'rentals:view' | 'rentals:create' | 'rentals:update' | 'rentals:delete'
    // Payments
    | 'payments:view' | 'payments:create' | 'payments:delete'
    // Returns
    | 'returns:view' | 'returns:create' | 'returns:update' | 'returns:settle' | 'returns:noc'
    // Batteries
    | 'batteries:view' | 'batteries:create' | 'batteries:update' | 'batteries:delete'
    // Battery Swaps
    | 'batterySwaps:view' | 'batterySwaps:create'
    // Battery Rentals
    | 'batteryRentals:view' | 'batteryRentals:create' | 'batteryRentals:update' | 'batteryRentals:return'
    // Staff & Settings (Admin only)
    | 'staff:view' | 'staff:manage'
    | 'settings:view' | 'settings:update'
    // Reports
    | 'reports:view' | 'reports:export'
    // Alerts
    | 'alerts:view' | 'alerts:update';


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
    createdAt: string;
    updatedAt: string;
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
    assignedBatteryId?: ID;
    createdAt: string;
    updatedAt: string;
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
    actualReturnDate: string | null;
    status: RentalStatus;
    payableTotal: number;
    paidTotal: number;
    balanceDue: number;
    createdAt: string;
    updatedAt: string;
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
    createdAt: string;
    updatedAt: string;
    // Denormalized for convenience
    rider: Rider;
    rental: Rental;
}

export interface Alert {
    id: ID;
    type: 'Payment Due' | 'Document Expiry' | 'Overdue Rental' | 'Return Completed' | 'Battery Low Health' | 'Battery Low Charge' | 'Battery Rental Overdue' | 'Battery Missing';
    relatedId: string;
    message: string;
    dueDate: string;
    status: 'read' | 'unread';
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: ID;
    email: string;
    displayName: string;
    role: Role;
    permissions?: Permission[];
    status: 'active' | 'disabled';
    lastLogin: string;
}

export interface Staff extends User {
    createdAt: string;
    updatedAt: string;
}

export interface Settings {
    companyName: string;
    currency: Currency;
    graceDays: number;
    dailyRateDefault: number;
    weeklyRateDefault: number;
    lateFeeEnabled: boolean;
    lateFeePerDay: number;
    taxPercentDefault: number;
    nocTemplate: string;
    batteryHealthThresholdWarn: number;
    batteryHealthThresholdCrit: number;
    batteryChargeThresholdWarn: number;
    contactAddress?: string;
    contactPhone?: string;
    contactEmail?: string;
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

export interface ReturnInspection {
    id: ID;
    rentalId: ID;
    riderId: ID;
    vehicleId: ID;
    odometerEnd?: number;
    chargePercent?: number;
    damageNotes?: string;
    damagePhotos?: { id: ID; url: string; name: string }[];
    accessoriesReturned?: {
        helmet: boolean;
        charger: boolean;
        phoneHolder: boolean;
        others?: string;
    };
    isBatteryMissing: boolean;
    missingItemsCharge: number;
    lateDays: number;
    lateFee: number;
    cleaningFee: number;
    damageFee: number;
    otherAdjustments: number;
    taxPercent: number;
    subtotal: number;
    taxAmount: number;
    totalDue: number;
    depositHeld?: number;
    depositReturn?: number;
    finalAmount: number;
    remarks?: string;
    settled: boolean;
    settledAt?: string;
    nocIssued: boolean;
    nocId?: ID;
    createdAt: string; updatedAt: string;
}

export type BatteryStatus = 'available' | 'assigned' | 'charging' | 'out_of_service' | 'lost' | 'service_due';

export interface BatteryPack {
    id: ID;
    serialNumber: string;
    type: 'OEM' | 'Aftermarket';
    capacityWh: number;
    healthPercent: number;
    chargePercent: number;
    cycleCount: number;
    status: BatteryStatus;
    assignedVehicleId?: ID;
    lastSwapAt?: string;
    lastServiceAt: string;
    notes?: string;
    createdAt: string; updatedAt: string;
}

export interface BatterySwap {
    id: ID;
    outBatteryId?: ID;
    inBatteryId?: ID;
    vehicleId?: ID;
    riderId?: ID;
    rentalId?: ID;
    swapAt: string;
    location?: string;
    operatorUserId?: ID;
    inSoC: number;
    outSoC: number;
    notes?: string;
    createdAt: string; updatedAt: string;
}

export type BatteryRentalStatus = 'ongoing' | 'returned' | 'overdue' | 'cancelled';

export interface BatteryRental {
    id: ID;
    riderId: ID;
    rentalId?: ID;
    batteryId: ID;
    plan: 'daily' | 'weekly' | 'per_swap';
    ratePerDay: number;
    ratePerWeek: number;
    perSwapFee: number;
    startDate: string;
    expectedReturnDate?: string;
    actualReturnDate?: string;
    status: BatteryRentalStatus;
    payableTotal: number;
    paidTotal: number;
    balanceDue: number;
    notes?: string;
    createdAt: string; updatedAt: string;
}

export interface Noc {
    id: ID;
    rentalId: ID;
    returnInspectionId: ID;
    content: string;
    generatedAt: string;
}
