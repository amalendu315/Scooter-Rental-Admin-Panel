
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
});

export const SettingsSchema = z.object({
    companyName: z.string().min(2, "Company name is required"),
    graceDays: z.coerce.number().int().min(0),
    dailyRateDefault: z.coerce.number().positive(),
    weeklyRateDefault: z.coerce.number().positive(),
    lateFeeEnabled: z.boolean(),
    lateFeePerDay: z.coerce.number().min(0),
});
