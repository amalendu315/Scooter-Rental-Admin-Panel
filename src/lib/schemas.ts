
import { z } from 'zod';

export const RiderSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    phone: z.string().regex(/^\d{10}$/, "Must be a valid 10-digit phone number"),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    idProofType: z.enum(['Aadhaar', 'DL', 'Passport']),
    idProofNumber: z.string().min(5, "ID proof number is required"),
    documentExpiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    status: z.enum(['active', 'blocked']),
});

export const VehicleSchema = z.object({
    code: z.string().min(3, "Code is required"),
    make: z.string().min(2, "Make is required"),
    model: z.string().min(1, "Model is required"),
    color: z.string().optional(),
    registrationNumber: z.string().min(6, "Registration number is required"),
    batteryHealth: z.coerce.number().min(0).max(100, "Must be between 0 and 100"),
    lastServiceDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
});

export const RentalSchema = z.object({
    riderId: z.string().min(1, "Rider is required"),
    vehicleId: z.string().min(1, "Vehicle is required"),
    plan: z.enum(['daily', 'weekly']),
    startDate: z.date(),
    expectedReturnDate: z.date(),
    payableTotal: z.coerce.number().min(0),
});

export const PaymentSchema = z.object({
    rentalId: z.string().min(1, "Rental selection is required"),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    method: z.enum(['cash', 'upi', 'card', 'bank', 'online']),
    transactionDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    txnRef: z.string().optional(),
});

export const StaffSchema = z.object({
    displayName: z.string().min(2, "Display name is required"),
    email: z.string().email("Invalid email address"),
    role: z.enum(['ADMIN', 'STAFF']),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    status: z.enum(['active', 'disabled']),
    permissions: z.array(z.string()).optional(),
});

export const SettingsSchema = z.object({
    companyName: z.string().min(2, "Company name is required"),
    graceDays: z.coerce.number().int().min(0),
    dailyRateDefault: z.coerce.number().positive(),
    weeklyRateDefault: z.coerce.number().positive(),
    lateFeeEnabled: z.boolean(),
    lateFeePerDay: z.coerce.number().min(0),
    taxPercentDefault: z.coerce.number().min(0).max(100),
    nocTemplate: z.string().optional(),
    batteryHealthThresholdWarn: z.coerce.number().min(0).max(100),
    batteryHealthThresholdCrit: z.coerce.number().min(0).max(100),
    batteryChargeThresholdWarn: z.coerce.number().min(0).max(100),
    contactAddress: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email().optional(),
});

export const ReturnInspectionSchema = z.object({
    odometerEnd: z.coerce.number().min(0).optional(),
    chargePercent: z.coerce.number().min(0).max(100).optional(),
    damageNotes: z.string().optional(),
    accessoriesReturned: z.object({
        helmet: z.boolean().default(false),
        charger: z.boolean().default(false),
        phoneHolder: z.boolean().default(false),
        others: z.string().optional(),
    }).optional(),
    isBatteryMissing: z.boolean().default(false),
    missingItemsCharge: z.coerce.number().min(0).default(0),
    cleaningFee: z.coerce.number().min(0).default(0),
    damageFee: z.coerce.number().min(0).default(0),
    otherAdjustments: z.coerce.number().default(0),
    taxPercent: z.coerce.number().min(0).max(100).default(18),
    remarks: z.string().optional(),
});

export const BatteryPackSchema = z.object({
    serialNumber: z.string().min(5, "Serial number is required"),
    type: z.enum(['OEM', 'Aftermarket']),
    capacityWh: z.coerce.number().min(0),
    healthPercent: z.coerce.number().min(0).max(100),
    chargePercent: z.coerce.number().min(0).max(100),
    cycleCount: z.coerce.number().int().min(0),
    status: z.enum(['available', 'assigned', 'charging', 'out_of_service', 'lost', 'service_due']),
    lastServiceAt: z.string().refine(val => !val || !isNaN(Date.parse(val)), "Invalid date"),
    notes: z.string().optional(),
});

export const BatterySwapSchema = z.object({
    outBatteryId: z.string().optional(),
    inBatteryId: z.string().optional(),
    vehicleId: z.string().optional(),
    riderId: z.string().optional(),
    rentalId: z.string().optional(),
    swapAt: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid date"),
    location: z.string().optional(),
    inSoC: z.coerce.number().min(0).max(100),
    outSoC: z.coerce.number().min(0).max(100),
    notes: z.string().optional(),
}).refine(data => data.outBatteryId || data.inBatteryId, {
    message: "At least one battery (in or out) must be specified.",
});

export const BatteryRentalSchema = z.object({
    riderId: z.string().min(1, "Rider is required"),
    rentalId: z.string().optional(),
    batteryId: z.string().min(1, "Battery is required"),
    plan: z.enum(['daily', 'weekly', 'per_swap']),
    ratePerDay: z.coerce.number().min(0).optional(),
    ratePerWeek: z.coerce.number().min(0).optional(),
    perSwapFee: z.coerce.number().min(0).optional(),
    startDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid date"),
    expectedReturnDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), "Invalid date"),
    payableTotal: z.coerce.number().min(0),
    notes: z.string().optional(),
});

