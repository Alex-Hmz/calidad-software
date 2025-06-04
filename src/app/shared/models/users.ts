import { UserRoleEnum } from "./enums";

export interface UserProfile {
    name: string;
    email: string;
    birthdate: Date;
    phone: string;
    address: string;
    medicalConditions?: string;
    role: string;
    createdAt: Date;
    isActive?: boolean; // Optional field to indicate if the user is active
}

export interface DoctorProfile extends UserProfile {
    id: string;
    specialty: string;
    dailyAppointments: number;
    schechule: {
        start: string; // HH:mm
        end: string; // HH:mm
    };
    role: UserRoleEnum.doctor;
}

export interface UpdateDoctor extends UserProfile{

    specialty: string;
    dailyAppointments: number;
    schechule: {
        start: string; // HH:mm
        end: string; // HH:mm
    };
    role: UserRoleEnum.doctor;
}

