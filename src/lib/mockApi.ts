
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import { addDays, subDays, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';
import type {
    Rider, Vehicle, Rental, Payment, Alert, User, Settings, ID,
    RentalStatus, Plan, PayMethod, ListParams, Paginated, Staff
} from './types';

const MOCK_DB_KEY = 'zapgo.mockdb.v1';
const SIMULATE_LATENCY = true;
const SIMULATE_ERRORS = true; // 2% chance of error
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
                db = JSON.parse(data);
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
const seedDb = () => {
    db = {
        riders: [],
        vehicles: [],
        rentals: [],
        payments: [],
        alerts: [],
        users: [],
        settings: {
            companyName: 'ZapGo Rentals Pvt. Ltd.',
            currency: 'INR',
            graceDays: 2,
            dailyRateDefault: 1200,
            weeklyRateDefault: 7000,
            lateFeeEnabled: true,
            lateFeePerDay: 500,
        },
    };

    const creationDate = faker.date.past({years: 1}).toISOString();

    // Seed Users
    db.users.push({ id: uuid(), email: 'admin@zapgo.com', displayName: 'Admin User', role: 'ADMIN', lastLogin: now(), status: 'active', createdAt: creationDate, updatedAt: creationDate });
    db.users.push({ id: uuid(), email: 'staff@zapgo.com', displayName: 'Staff User', role: 'STAFF', lastLogin: now(), status: 'active', createdAt: creationDate, updatedAt: creationDate });

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

    // Seed Vehicles
    for (let i = 0; i < 10; i++) {
        const lastServiceDate = faker.date.past({years: 1});
        const createdAt = faker.date.past({years: 1}).toISOString();
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
            createdAt,
            updatedAt: createdAt,
        });
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
                if (value === undefined || value === null || value === '') return true;
                // Add specific filter logic here if needed, simple equality check for now
                return (item as any)[key] === value;
            });
        });
    }

    // Sort
    if (sortBy && items[0]?.[sortBy as keyof T]) {
        items.sort((a, b) => {
            const valA = (a as any)[sortBy];
            const valB = (b as any)[sortBy];
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

export const createRental = async (data: Omit<Rental, 'id'|'createdAt'|'updatedAt'|'status'|'paidTotal'|'balanceDue'|'rider'|'vehicle'>): Promise<Rental> => {
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
    const paginated = await list(db.payments, params, []);
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

    // If fully paid and already returned, status is 'completed'
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

export const createStaff = async (data: Omit<Staff, 'id'|'createdAt'|'updatedAt'|'lastLogin'>): Promise<Staff> => {
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
    Object.assign(db.settings, { ...data, updatedAt: now() });
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
    }
}

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
