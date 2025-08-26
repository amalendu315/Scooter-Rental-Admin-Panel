
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import { addDays, subDays, isBefore, isAfter, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import type {
    Rider, Vehicle, Rental, Payment, Alert, User, Settings, ID,
    RentalStatus, Plan, PayMethod, ListParams, Paginated, Staff,
    ReturnInspection, BatteryPack, BatterySwap, BatteryRental, BatteryStatus, Permission, Noc
} from './types';

const MOCK_DB_KEY = 'zapgo.mockdb.v4';
const SIMULATE_LATENCY = true;
const SIMULATE_ERRORS = false;
const ERROR_RATE = 0.02;

// #region Helper Functions
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const randomLatency = () => Math.floor(Math.random() * (600 - 250 + 1) + 250);

const shouldError = () => SIMULATE_ERRORS && Math.random() < ERROR_RATE;

const now = () => new Date().toISOString();
// #endregion

// #region In-memory DB with localStorage persistence
interface MockDB {
    riders: Rider[];
    vehicles: Vehicle[];
    rentals: Rental[];
    payments: Payment[];
    alerts: Alert[];
    users: Staff[];
    settings: Settings;
    returnInspections: ReturnInspection[];
    batteryPacks: BatteryPack[];
    batterySwaps: BatterySwap[];
    batteryRentals: BatteryRental[];
    nocs: Noc[];
}

let db: MockDB;

const isBrowser = typeof window !== 'undefined';


export const runDailyScheduler = (isSeeding = false) => {
    const today = new Date();

    if(!db?.rentals) return { success: false, message: 'DB not initialized' };

    // Flag overdue rentals
    db.rentals.forEach(r => {
        if(r.status === 'ongoing' && isBefore(new Date(r.expectedReturnDate), today)) {
            r.status = 'overdue';
        }
    });

    // Create alerts
    if (!isSeeding) { // Don't create new alerts when just seeding
        db.rentals.forEach(r => {
            if (r.status === 'overdue') {
                const existingAlert = db.alerts.find(a => a.relatedId === r.id && a.type === 'Overdue Rental');
                if (!existingAlert) {
                    db.alerts.unshift({
                        id: uuid(),
                        type: 'Overdue Rental',
                        relatedId: r.id,
                        message: `Rental #${r.id.substring(0,4)} is overdue.`,
                        dueDate: r.expectedReturnDate,
                        status: 'unread',
                        createdAt: now(),
                        updatedAt: now()
                    });
                }
            }
        });
    }

    saveDb();
    console.log("Daily scheduler run complete.");
    return { success: true };
}


const saveDb = () => {
    if (!isBrowser) return;
    try {
        localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
    } catch (e) {
        console.error("Failed to save mock DB to localStorage", e);
    }
};


const loadDb = () => {
    try {
        if (isBrowser) {
            const data = localStorage.getItem(MOCK_DB_KEY);
            if (data) {
                const loadedDb = JSON.parse(data);
                const defaultDb = getEmptyDb();
                // Ensure all top-level keys exist to prevent crashes after schema updates
                for (const key of Object.keys(defaultDb)) {
                    if (!loadedDb.hasOwnProperty(key)) {
                        loadedDb[key] = (defaultDb as any)[key];
                    }
                }
                db = loadedDb;
                console.log("Mock DB loaded from localStorage.");
                return;
            }
        }

        console.log("No mock DB found or not in browser, seeding new data.");
        seedDb();
        saveDb();

    } catch (e) {
        console.error("Failed to load mock DB, re-seeding.", e);
        seedDb();
        saveDb();
    }
};
// #endregion

// #region Data Seeding
const getEmptyDb = (): MockDB => ({
    riders: [],
    vehicles: [],
    rentals: [],
    payments: [],
    alerts: [],
    users: [],
    settings: {
        companyName: 'ZapGo Rental',
        currency: 'INR',
        graceDays: 2,
        dailyRateDefault: 400,
        weeklyRateDefault: 2400,
        lateFeeEnabled: true,
        lateFeePerDay: 50,
        taxPercentDefault: 18,
        nocTemplate: "This is to certify that {{riderName}} (ID: {{riderId}}) has returned vehicle {{vehicleCode}} (Reg: {{registrationNumber}}) for Rental {{rentalId}} on {{actualReturnDate}} with no outstanding dues (₹{{finalAmount}}). Issued on {{generatedAt}} by {{companyName}}.",
        batteryHealthThresholdWarn: 60,
        batteryHealthThresholdCrit: 40,
        batteryChargeThresholdWarn: 20,
        contactAddress: '123 Electric Ave, Bangalore, 560001',
        contactEmail: 'contact@zapgo.in',
        contactPhone: '+91 9998887776'
    },
    returnInspections: [],
    batteryPacks: [],
    batterySwaps: [],
    batteryRentals: [],
    nocs: []
});


const seedDb = () => {
    db = getEmptyDb();

    // Seed Users
    const allOpsPermissions: Permission[] = [ 'riders:view', 'riders:create', 'riders:update', 'vehicles:view', 'rentals:view', 'rentals:create', 'rentals:update', 'payments:view', 'payments:create', 'returns:view', 'returns:create', 'returns:update', 'returns:settle', 'returns:noc', 'batteries:view', 'batterySwaps:view', 'batterySwaps:create', 'batteryRentals:view', 'batteryRentals:create', 'batteryRentals:update' ];
    const limitedPermissions: Permission[] = [ 'riders:view', 'vehicles:view', 'rentals:view', 'returns:view', 'batteries:view' ];

    db.users.push({ id: 's-admin', email: 'admin@zapgo.in', displayName: 'Admin User', role: 'ADMIN', lastLogin: now(), status: 'active', createdAt: now(), updatedAt: now(), permissions: [] });
    db.users.push({ id: 's-ops', email: 'ops@zapgo.in', displayName: 'Ops User', role: 'STAFF', lastLogin: now(), status: 'active', createdAt: now(), updatedAt: now(), permissions: allOpsPermissions });
    db.users.push({ id: 's-limited', email: 'limited@zapgo.in', displayName: 'Limited User', role: 'STAFF', lastLogin: now(), status: 'active', createdAt: now(), updatedAt: now(), permissions: limitedPermissions });

    // Seed Riders
    for (let i = 0; i < 20; i++) {
        const createdAt = faker.date.past({years: 1}).toISOString();
        db.riders.push({
            id: uuid(),
            fullName: faker.person.fullName(),
            phone: faker.string.numeric(10),
            email: faker.internet.email().toLowerCase(),
            city: faker.location.city(),
            address: faker.location.streetAddress(),
            idProofType: faker.helpers.arrayElement(['Aadhaar', 'DL', 'Passport']),
            idProofNumber: faker.string.alphanumeric(12).toUpperCase(),
            documentExpiryDate: faker.date.future({years: 5}).toISOString(),
            status: faker.helpers.arrayElement(['active', 'active', 'active', 'blocked']),
            rentalsCount: 0,
            totalSpent: 0,
            kycDocuments: [],
            createdAt,
            updatedAt: createdAt,
        });
    }

    // Seed Battery Packs
    for(let i=0; i<14; i++) {
        const createdAt = faker.date.past({years:1}).toISOString();
        db.batteryPacks.push({
            id: uuid(),
            serialNumber: `BTRY-${faker.string.alphanumeric(8).toUpperCase()}`,
            type: faker.helpers.arrayElement(['OEM', 'Aftermarket']),
            capacityWh: faker.helpers.arrayElement([2000, 2500, 3000]),
            healthPercent: faker.number.int({min: 35, max: 95}),
            chargePercent: faker.number.int({min: 5, max: 100}),
            cycleCount: faker.number.int({min: 50, max: 500}),
            status: 'available',
            lastServiceAt: faker.date.past({years: 1}).toISOString(),
            createdAt,
            updatedAt: createdAt
        })
    }

    // Seed Vehicles
    for (let i = 0; i < 10; i++) {
        const lastServiceDate = faker.date.past({years: 1});
        const createdAt = faker.date.past({years: 1}).toISOString();
        const battery = db.batteryPacks[i];
        db.vehicles.push({
            id: uuid(),
            code: `ZG-${faker.string.alphanumeric(4).toUpperCase()}`,
            make: faker.vehicle.manufacturer(),
            model: faker.vehicle.model(),
            color: faker.vehicle.color(),
            registrationNumber: `MH${faker.string.numeric(2)}${faker.string.alpha(2).toUpperCase()}${faker.string.numeric(4)}`,
            batteryHealth: faker.number.int({ min: 80, max: 100 }),
            lastServiceDate: lastServiceDate.toISOString(),
            available: true,
            isServiceDue: isBefore(lastServiceDate, subDays(new Date(), 90)),
            assignedBatteryId: battery.id,
            createdAt,
            updatedAt: createdAt,
        });
        battery.status = 'assigned';
        battery.assignedVehicleId = db.vehicles[i].id;
    }

    // Seed Rentals
    for(let i=0; i < 12; i++) {
        const rider = faker.helpers.arrayElement(db.riders);
        const vehicle = faker.helpers.arrayElement(db.vehicles.filter(v => v.available));
        if(!vehicle) continue;

        const isWeekly = i % 3 === 0;
        const plan = isWeekly ? 'weekly' : 'daily';
        const totalDays = isWeekly ? faker.number.int({ min: 7, max: 14 }) : faker.number.int({min: 1, max: 5});
        const startDate = faker.date.recent({ days: 10 });
        const expectedReturnDate = addDays(startDate, totalDays);

        const payableTotal = isWeekly ? Math.ceil(totalDays/7) * db.settings.weeklyRateDefault : totalDays * db.settings.dailyRateDefault;
        const paidTotal = faker.number.int({ min: 0, max: payableTotal });
        const balanceDue = payableTotal - paidTotal;

        let status: RentalStatus = 'ongoing';
        let actualReturnDate = null;

        // 3 due today
        if (i < 3) Object.assign(expectedReturnDate, addDays(new Date(), 0));
        // 2 overdue
        else if (i < 5) Object.assign(expectedReturnDate, subDays(new Date(), faker.number.int({min: 1, max: 3})));
        // 2 ongoing
        else if (i < 7) Object.assign(expectedReturnDate, addDays(new Date(), faker.number.int({min: 2, max: 5})));
        // 3 returned
        else if (i < 10) {
            status = 'completed';
            actualReturnDate = faker.date.recent({days: 7}).toISOString();
        }
        // 2 cancelled
        else {
            status = 'cancelled';
        }


        const rental: Rental = {
            id: uuid(),
            riderId: rider.id,
            vehicleId: vehicle.id,
            plan,
            startDate: startDate.toISOString(),
            expectedReturnDate: expectedReturnDate.toISOString(),
            actualReturnDate,
            status,
            payableTotal,
            paidTotal,
            balanceDue,
            createdAt: startDate.toISOString(),
            updatedAt: startDate.toISOString(),
            rider,
            vehicle
        }
        db.rentals.push(rental);

        // Seed a payment for the rental
        if (paidTotal > 0) {
            const payment: Payment = {
                id: uuid(),
                rentalId: rental.id,
                riderId: rider.id,
                amount: paidTotal,
                method: faker.helpers.arrayElement(['upi', 'card', 'cash']),
                transactionDate: rental.startDate,
                createdAt: rental.startDate,
                updatedAt: rental.startDate,
                rider,
                rental
            };
            db.payments.push(payment);
        }

        //@ts-ignore
        if(status === 'ongoing' || status === 'overdue') {
            vehicle.available = false;
            vehicle.currentRentalId = rental.id;
        }
    }

    // Seed Return Inspections
    const dueRentals = db.rentals.filter(r => isAfter(new Date(r.expectedReturnDate), subDays(new Date(), 1)) && (r.status === 'ongoing' || r.status === 'overdue')).slice(0, 4);
    const settledRentals = db.rentals.filter(r => r.status === 'completed').slice(0, 2);

    if (dueRentals.length >= 4) {
        const r1 = dueRentals[0];
        db.returnInspections.push({ id: uuid(), rentalId: r1.id, riderId: r1.riderId, vehicleId: r1.vehicleId, lateDays: 0, lateFee: 0, cleaningFee: 0, damageFee: 0, isBatteryMissing: false, missingItemsCharge: 0, otherAdjustments: 0, taxPercent: 18, subtotal: 0, taxAmount: 0, finalAmount: r1.balanceDue, totalDue: r1.balanceDue, settled: false, nocIssued: false, createdAt: now(), updatedAt: now(), remarks: 'Demo: Clean Return' });

        const r2 = dueRentals[1];
        db.returnInspections.push({ id: uuid(), rentalId: r2.id, riderId: r2.riderId, vehicleId: r2.vehicleId, damageNotes: 'Scratches on left panel', damageFee: 800, cleaningFee: 150, accessoriesReturned: { helmet: true, charger: false, phoneHolder: true }, missingItemsCharge: 500, lateDays: 0, lateFee: 0, isBatteryMissing: false, otherAdjustments: 0, taxPercent: 18, subtotal: 1450, taxAmount: 261, finalAmount: r2.balanceDue + 1711, totalDue: r2.balanceDue + 1711, settled: false, nocIssued: false, createdAt: now(), updatedAt: now(), remarks: 'Demo: Damages + Missing Charger' });

        const r3 = dueRentals[2];
        db.returnInspections.push({ id: uuid(), rentalId: r3.id, riderId: r3.riderId, vehicleId: r3.vehicleId, isBatteryMissing: true, missingItemsCharge: 2500, lateDays: 0, lateFee: 0, cleaningFee: 0, damageFee: 0, otherAdjustments: 0, taxPercent: 18, subtotal: 2500, taxAmount: 450, finalAmount: r3.balanceDue + 2950, totalDue: r3.balanceDue + 2950, settled: false, nocIssued: false, createdAt: now(), updatedAt: now(), remarks: 'Demo: Battery Missing' });

        const r4 = dueRentals[3];
        const lateDays = differenceInDays(new Date(), new Date(r4.expectedReturnDate));
        db.returnInspections.push({ id: uuid(), rentalId: r4.id, riderId: r4.riderId, vehicleId: r4.vehicleId, lateDays, lateFee: lateDays * db.settings.lateFeePerDay, otherAdjustments: -100, isBatteryMissing: false, missingItemsCharge: 0, cleaningFee: 0, damageFee: 0, taxPercent: 18, subtotal: (lateDays*50)-100, taxAmount: ((lateDays*50)-100)*0.18, finalAmount: r4.balanceDue + ((lateDays*50)-100)*1.18, totalDue: r4.balanceDue + ((lateDays*50)-100)*1.18, settled: false, nocIssued: false, createdAt: now(), updatedAt: now(), remarks: 'Demo: Overdue + Goodwill' });
    }

    if (settledRentals.length >= 2) {
        const r5 = settledRentals[0];
        const inspId = uuid();
        const nocId = uuid();
        db.returnInspections.push({ id: inspId, rentalId: r5.id, riderId: r5.riderId, vehicleId: r5.vehicleId, lateDays: 0, lateFee: 0, cleaningFee: 0, damageFee: 0, isBatteryMissing: false, missingItemsCharge: 0, otherAdjustments: 0, taxPercent: 18, subtotal: 0, taxAmount: 0, finalAmount: 0, totalDue: 0, settled: true, settledAt: faker.date.recent({days: 3}).toISOString(), nocIssued: true, nocId, createdAt: now(), updatedAt: now(), remarks: 'Demo: Settled with NOC' });
        db.nocs.push({ id: nocId, rentalId: r5.id, returnInspectionId: inspId, content: 'NOC Content Placeholder', generatedAt: now() });

        const r6 = settledRentals[1];
        db.returnInspections.push({ id: uuid(), rentalId: r6.id, riderId: r6.riderId, vehicleId: r6.vehicleId, damageFee: 2600, depositHeld: 2000, depositReturn: -600, lateDays: 0, lateFee: 0, cleaningFee: 0, isBatteryMissing: false, missingItemsCharge: 0, otherAdjustments: 0, taxPercent: 18, subtotal: 2600, taxAmount: 468, finalAmount: 3068, totalDue: 3068, settled: true, settledAt: faker.date.recent({days: 2}).toISOString(), nocIssued: false, createdAt: now(), updatedAt: now(), remarks: 'Demo: Heavy Damage' });
    }

    runDailyScheduler(true); // Initial run to create alerts for seeded data
};

// Initial load
if (isBrowser) {
    loadDb();
}
// #endregion

// #region Generic List Function
const list = async <T extends { createdAt?: string }>(
    collection: T[],
    params: ListParams = {},
    searchFields: (keyof T)[] = [],
): Promise<Paginated<T>> => {
    if (SIMULATE_LATENCY) await sleep(randomLatency());
    if (shouldError()) throw new Error("A random mock API error occurred!");

    const { page = 1, pageSize = 10, sortBy = 'createdAt', sortDir = 'desc', q, filters } = params;

    let items = [...collection];

    // Search
    if (q && searchFields.length) {
        const lowerQ = q.toLowerCase();
        items = items.filter(item =>
            searchFields.some(field =>
                String(item[field]).toLowerCase().includes(lowerQ)
            )
        );
    }

    // Filters
    if (filters) {
        items = items.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (value === undefined || value === null || value === '' || value.length === 0) return true;

                if (key.endsWith('_ne') && value) {
                    const actualKey = key.replace('_ne', '');
                    return (item as any)[actualKey] !== value;
                }
                if (key.endsWith('_gte') && value) {
                    const actualKey = key.replace('_gte', '');
                    return (item as any)[actualKey] >= value;
                }
                if (key.endsWith('_lte') && value) {
                    const actualKey = key.replace('_lte', '');
                    return (item as any)[actualKey] <= value;
                }

                if (Array.isArray(value)) {
                    return value.includes((item as any)[key]);
                }

                return (item as any)[key] === value;
            });
        });
    }

    // Sort
    if (sortBy && items[0]?.[sortBy as keyof T]) {
        items.sort((a, b) => {
            const valA = (a as any)[sortBy];
            const valB = (b as any)[sortBy];

            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Paginate
    const total = items.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const rows = items.slice(start, end);

    return { rows, total, page, pageSize };
}
// #endregion


// #region API Functions

// Riders
export const listRiders = (params: ListParams) => list(db.riders, params, ['fullName', 'phone', 'email']);
export const getRider = async (id: ID): Promise<Rider | undefined> => {
    if (SIMULATE_LATENCY) await sleep(randomLatency());
    return db.riders.find(r => r.id === id);
}
export const createRider = async (data: Omit<Rider, 'id' | 'createdAt' | 'updatedAt' | 'rentalsCount' | 'totalSpent' | 'kycDocuments'>): Promise<Rider> => {
    const newRider: Rider = {
        ...data,
        id: uuid(),
        createdAt: now(),
        updatedAt: now(),
        rentalsCount: 0,
        totalSpent: 0,
        kycDocuments: [],
    };
    db.riders.unshift(newRider);
    saveDb();
    return newRider;
}
export const updateRider = async (id: ID, data: Partial<Rider>): Promise<Rider> => {
    const rider = db.riders.find(r => r.id === id);
    if (!rider) throw new Error("Rider not found");
    Object.assign(rider, { ...data, updatedAt: now() });
    saveDb();
    return rider;
}
export const deleteRider = async (id: ID) => {
    db.riders = db.riders.filter(r => r.id !== id);
    saveDb();
    return { success: true };
}

// Vehicles
export const listVehicles = (params: ListParams) => list(db.vehicles, params, ['code', 'make', 'model', 'registrationNumber']);
export const listAvailableVehicles = async (params: { startDate: string, endDate: string }): Promise<Vehicle[]> => {
    if (SIMULATE_LATENCY) await sleep(randomLatency());
    // In a real API, this would check for overlapping rentals.
    // For mock, we just check the `available` flag.
    return db.vehicles.filter(v => v.available);
}

export const getVehicle = async (id: ID): Promise<Vehicle | undefined> => {
    if (SIMULATE_LATENCY) await sleep(randomLatency());
    return db.vehicles.find(v => v.id === id);
}

export const createVehicle = async (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'available' | 'isServiceDue'>): Promise<Vehicle> => {
    const newVehicle: Vehicle = {
        ...data,
        id: uuid(),
        available: true,
        isServiceDue: isBefore(new Date(data.lastServiceDate), subDays(new Date(), 90)),
        createdAt: now(),
        updatedAt: now(),
    };
    db.vehicles.unshift(newVehicle);
    saveDb();
    return newVehicle;
}

export const updateVehicle = async (id: ID, data: Partial<Vehicle>): Promise<Vehicle> => {
    const vehicle = db.vehicles.find(v => v.id === id);
    if (!vehicle) throw new Error("Vehicle not found");
    Object.assign(vehicle, { ...data, updatedAt: now() });
    saveDb();
    return vehicle;
}

export const deleteVehicle = async (id: ID) => {
    const vehicle = db.vehicles.find(v => v.id === id);
    if(vehicle && !vehicle.available) {
        throw new Error("Cannot delete a vehicle that is currently rented out.");
    }
    db.vehicles = db.vehicles.filter(v => v.id !== id);
    saveDb();
    return { success: true };
}


// Rentals
export const listRentals = async (params: ListParams): Promise<Paginated<Rental>> => {
    const paginated = await list(db.rentals, params, []);
    paginated.rows.forEach(r => {
        r.rider = db.riders.find(rd => rd.id === r.riderId)!;
        r.vehicle = db.vehicles.find(v => v.id === r.vehicleId)!;
    });
    return paginated;
};

export const getRental = async (id: ID): Promise<Rental | undefined> => {
    if (SIMULATE_LATENCY) await sleep(randomLatency());
    const rental = db.rentals.find(r => r.id === id);
    if(rental) {
        rental.rider = db.riders.find(rd => rd.id === rental.riderId)!;
        rental.vehicle = db.vehicles.find(v => v.id === rental.vehicleId)!;
    }
    return rental;
}

export const createRental = async (data: Omit<Rental, 'id'|'createdAt'|'updatedAt'|'status'|'paidTotal'|'balanceDue'|'rider'|'vehicle'|'actualReturnDate'>): Promise<Rental> => {
    const vehicle = db.vehicles.find(v => v.id === data.vehicleId);
    if (!vehicle || !vehicle.available) throw new Error("Vehicle is not available.");

    const rider = db.riders.find(r => r.id === data.riderId);
    if (!rider) throw new Error("Rider not found");

    const newRental: Rental = {
        ...data,
        id: uuid(),
        createdAt: now(),
        updatedAt: now(),
        status: 'ongoing',
        paidTotal: 0,
        balanceDue: data.payableTotal,
        rider: rider,
        vehicle: vehicle,
        actualReturnDate: null,
    };
    db.rentals.unshift(newRental);

    vehicle.available = false;
    vehicle.currentRentalId = newRental.id;

    saveDb();
    return newRental;
}

export const returnRental = async (id: ID): Promise<Rental> => {
    const rental = db.rentals.find(r => r.id === id);
    if (!rental) throw new Error("Rental not found");

    rental.actualReturnDate = now();
    rental.status = 'completed';
    rental.updatedAt = now();

    const vehicle = db.vehicles.find(v => v.id === rental.vehicleId);
    if(vehicle) {
        vehicle.available = true;
        vehicle.currentRentalId = undefined;
    }

    const rider = db.riders.find(rd => rd.id === rental.riderId);
    if (rider) {
        rider.rentalsCount = (rider.rentalsCount || 0) + 1;
    }

    saveDb();
    return rental;
}


// Payments
export const listPayments = async (params: ListParams): Promise<Paginated<Payment>> => {
    //@ts-ignore
    const paginated = await list(db.payments, params, ['rentalId', 'rider.fullName']);
    paginated.rows.forEach(p => {
        p.rider = db.riders.find(rd => rd.id === p.riderId)!;
        p.rental = db.rentals.find(r => r.id === p.rentalId)!;
    });
    return paginated;
};

export const createPayment = async (data: Omit<Payment, 'id'|'createdAt'|'updatedAt'|'rider'|'rental'>): Promise<Payment> => {
    const rental = db.rentals.find(r => r.id === data.rentalId);
    if(!rental) throw new Error("Associated rental not found");
    const rider = db.riders.find(rd => rd.id === data.riderId);
    if(!rider) throw new Error("Associated rider not found");

    const newPayment: Payment = {
        ...data,
        id: uuid(),
        createdAt: now(),
        updatedAt: now(),
        rider: rider,
        rental: rental,
    };
    db.payments.unshift(newPayment);

    rental.paidTotal += data.amount;
    rental.balanceDue = rental.payableTotal - rental.paidTotal;
    if (rental.balanceDue < 0) rental.balanceDue = 0;

    if (rental.balanceDue <= 0 && rental.actualReturnDate) {
        rental.status = 'completed';
    }

    rental.updatedAt = now();

    saveDb();
    return newPayment;
}

// Alerts
export const listAlerts = (params: ListParams) => list(db.alerts, params, ['message']);
export const markAlertRead = async (id: ID): Promise<Alert | undefined> => {
    const alert = db.alerts.find(a => a.id === id);
    if(alert) {
        alert.status = 'read';
        alert.updatedAt = now();
        saveDb();
    }
    return alert;
}

// Users & Settings
export const listUsers = (params: ListParams) => list(db.users, params, ['displayName', 'email']);

export const createStaff = async (data: Omit<Staff, "id" | "lastLogin" | "createdAt" | "updatedAt">): Promise<Staff> => {
    if (SIMULATE_LATENCY) await sleep(randomLatency());
    if (shouldError()) throw new Error("A random mock API error occurred!");
    if (db.users.some(u => u.email === data.email)) {
        throw new Error("A user with this email already exists.");
    }
    const newUser: Staff = {
        ...data,
        id: uuid(),
        lastLogin: now(),
        createdAt: now(),
        updatedAt: now(),
    };
    db.users.unshift(newUser);
    saveDb();
    return newUser;
};

export const getSettings = async (): Promise<Settings> => {
    if (SIMULATE_LATENCY) await sleep(randomLatency());
    return db.settings;
}
export const updateSettings = async (data: Partial<Settings>): Promise<Settings> => {
    Object.assign(db.settings, { ...data });
    saveDb();
    return db.settings;
}

export const updateUser = async (id: ID, data: Partial<Staff>): Promise<Staff> => {
    const user = db.users.find(u => u.id === id);
    if (!user) throw new Error("User not found");
    Object.assign(user, { ...data, updatedAt: now() });
    saveDb();
    return user;
}

export const deleteUser = async (id: ID) => {
    db.users = db.users.filter(u => u.id !== id);
    saveDb();
    return { success: true };
}


// Dashboard Stats
export const getCounters = async () => {
    if (SIMULATE_LATENCY) await sleep(randomLatency());
    const today = new Date();
    const earningsToday = db.payments
        .filter(p => isAfter(new Date(p.transactionDate), startOfDay(today)))
        .reduce((acc, p) => acc + p.amount, 0);

    return {
        earningsToday,
        vehiclesAvailable: db.vehicles.filter(v => v.available).length,
        totalVehicles: db.vehicles.length,
        ongoingRentals: db.rentals.filter(r => r.status === 'ongoing').length,
        overdueRentals: db.rentals.filter(r => r.status === 'overdue').length,
        batteries: {
            total: db.batteryPacks.length,
            available: db.batteryPacks.filter(b => b.status === 'available').length,
            assigned: db.batteryPacks.filter(b => b.status === 'assigned').length,
            charging: db.batteryPacks.filter(b => b.status === 'charging').length,
            service_due: db.batteryPacks.filter(b => b.status === 'service_due').length,
        }
    }
}

// #region New APIs

// Return Center
export const listReturnInspections = (params: ListParams) => list(db.returnInspections, params);

export const getReturnInspection = async (rentalId: ID): Promise<ReturnInspection | undefined> => {
    if (SIMULATE_LATENCY) await sleep(randomLatency());
    return db.returnInspections.find(r => r.rentalId === rentalId);
}

export const getReturnInspectionById = async (id: ID): Promise<ReturnInspection | undefined> => {
    if (SIMULATE_LATENCY) await sleep(randomLatency());
    return db.returnInspections.find(r => r.id === id);
}

export const createReturnInspection = async (data: Omit<ReturnInspection, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReturnInspection> => {
    const newInspection: ReturnInspection = {
        ...data,
        id: uuid(),
        createdAt: now(),
        updatedAt: now(),
    };
    db.returnInspections.unshift(newInspection);
    saveDb();
    return newInspection;
}

export const updateReturnInspection = async (id: ID, data: Partial<ReturnInspection>): Promise<ReturnInspection> => {
    const inspection = db.returnInspections.find(r => r.id === id);
    if (!inspection) throw new Error("Return inspection not found");
    Object.assign(inspection, { ...data, updatedAt: now() });
    saveDb();
    return inspection;
}

export const settleReturn = async (id: ID) => {
    const inspection = db.returnInspections.find(r => r.id === id);
    if (!inspection) throw new Error("Return inspection not found");

    const rental = db.rentals.find(r => r.id === inspection.rentalId);
    if (!rental) throw new Error("Associated rental not found");

    rental.actualReturnDate = now();
    rental.status = 'completed';
    rental.balanceDue = inspection.finalAmount || 0;
    rental.updatedAt = now();

    const vehicle = db.vehicles.find(v => v.id === rental.vehicleId);
    if (vehicle) {
        vehicle.available = true;
        vehicle.currentRentalId = undefined;
        vehicle.updatedAt = now();
    }

    inspection.settled = true;
    inspection.settledAt = now();
    inspection.updatedAt = now();

    db.alerts.unshift({
        id: uuid(),
        type: 'Return Completed',
        relatedId: rental.id,
        message: `Return for rental #${rental.id.substring(0,4)} settled.`,
        dueDate: now(),
        status: 'unread',
        createdAt: now(),
        updatedAt: now(),
    });

    saveDb();
    return { success: true, inspection };
}

export const generateNoc = async (returnId: ID) => {
    const inspection = db.returnInspections.find(r => r.id === returnId);
    if (!inspection || !inspection.settled) throw new Error("Return must be settled to generate NOC.");

    inspection.nocIssued = true;
    inspection.nocId = uuid();
    inspection.updatedAt = now();

    // In a real API, the backend would render the template. Here, we just store it.
    const newNoc: Noc = {
        id: inspection.nocId,
        rentalId: inspection.rentalId,
        returnInspectionId: inspection.id,
        content: db.settings.nocTemplate,
        generatedAt: now(),
    };
    db.nocs.push(newNoc);

    saveDb();
    return { success: true, nocId: inspection.nocId };
}


// Batteries
export const listBatteryPacks = (params: ListParams) => list(db.batteryPacks, params, ['serialNumber']);
export const getBatteryPack = async (id: ID): Promise<BatteryPack | undefined> => {
    if (SIMULATE_LATENCY) await sleep(randomLatency());
    return db.batteryPacks.find(b => b.id === id);
}
export const createBatteryPack = async (data: Omit<BatteryPack, 'id' | 'createdAt' | 'updatedAt'>): Promise<BatteryPack> => {
    const newPack: BatteryPack = { ...data, id: uuid(), createdAt: now(), updatedAt: now() };
    db.batteryPacks.unshift(newPack);
    saveDb();
    return newPack;
}
export const updateBatteryPack = async (id: ID, data: Partial<BatteryPack>): Promise<BatteryPack> => {
    const pack = db.batteryPacks.find(b => b.id === id);
    if (!pack) throw new Error("Battery pack not found");
    Object.assign(pack, { ...data, updatedAt: now() });
    saveDb();
    return pack;
}
export const deleteBatteryPack = async (id: ID) => {
    db.batteryPacks = db.batteryPacks.filter(b => b.id !== id);
    saveDb();
    return { success: true };
}


// Battery Swaps
export const listBatterySwaps = (params: ListParams) => list(db.batterySwaps, params);
export const createBatterySwap = async (data: Omit<BatterySwap, 'id' | 'createdAt' | 'updatedAt'>): Promise<BatterySwap> => {
    const newSwap: BatterySwap = { ...data, id: uuid(), createdAt: now(), updatedAt: now() };

    if (data.outBatteryId) {
        const outBattery = db.batteryPacks.find(b => b.id === data.outBatteryId);
        if (outBattery) {
            outBattery.status = 'assigned';
            outBattery.assignedVehicleId = data.vehicleId;
            outBattery.lastSwapAt = now();
            if(data.outSoC) outBattery.chargePercent = data.outSoC;
        }
    }

    if (data.inBatteryId) {
        const inBattery = db.batteryPacks.find(b => b.id === data.inBatteryId);
        if (inBattery) {
            inBattery.status = 'available'; // Or 'charging' depending on workflow
            inBattery.assignedVehicleId = undefined;
            if (inBattery.cycleCount) {
                inBattery.cycleCount += 1;
            } else {
                inBattery.cycleCount = 1;
            }
            if(data.inSoC) inBattery.chargePercent = data.inSoC;
        }
    }

    db.batterySwaps.unshift(newSwap);
    saveDb();
    return newSwap;
}

// Battery Rentals
export const listBatteryRentals = (params: ListParams) => list(db.batteryRentals, params);
export const createBatteryRental = async (data: Omit<BatteryRental, 'id'|'createdAt'|'updatedAt'|'status'|'paidTotal'|'balanceDue'>): Promise<BatteryRental> => {
    const newRental: BatteryRental = {
        ...data,
        id: uuid(),
        status: 'ongoing',
        paidTotal: 0,
        balanceDue: data.payableTotal,
        createdAt: now(),
        updatedAt: now(),
    };
    const battery = db.batteryPacks.find(b => b.id === data.batteryId);
    if(battery) battery.status = 'assigned';
    db.batteryRentals.unshift(newRental);
    saveDb();
    return newRental;
}


// #endregion

// DevTools
export const reseedDb = () => {
    seedDb();
    saveDb();
    return { success: true };
}

export const clearDb = () => {
    if(isBrowser) {
        localStorage.removeItem(MOCK_DB_KEY);
    }
    loadDb();
    return { success: true };
}

export const getDbAsJson = () => {
    return JSON.stringify(db, null, 2);
}

// #endregion
