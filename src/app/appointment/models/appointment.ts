import { AppointmentStatusEnum } from "../../shared/models/enums";



export interface Appointment {
    id: string;           
    userId: string;
    date: string;
    time: string;
    reason: string;
    estado: AppointmentStatusEnum;
    createdAt: number;
}

export interface CreateAppointment {
    userId: string;
    date: string;
    time: string;
    reason: string;
    estado: AppointmentStatusEnum;
    createdAt: number;
}