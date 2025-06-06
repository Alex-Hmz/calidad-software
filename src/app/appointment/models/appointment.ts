import { AppointmentStatusEnum } from "../../shared/models/enums";



export interface Appointment {
    id: string;           
    userId: string;
    date: string;
    time: string;
    reason: string;
    estado: AppointmentStatusEnum;
    typeId: string;
    doctorId?: string;
    traceId?: string; 
    traceName?: string;
    traceNotes?:string;
    createdAt: number;
}

export interface CreateAppointment {
    userId: string;
    date: string;
    time: string;
    typeId: string;
    reason: string;
    estado: AppointmentStatusEnum;
    traceId?: string; 
    createdAt: number;
}


export interface UpdateAppointment {
    userId: string;
    date: string;
    time: string;
    reason: string;
    estado: AppointmentStatusEnum;
    typeId: string;
    doctorId?: string;
    traceId?: string; 
    traceName?: string;
    traceNotes?:string;
    createdAt: number;
}

export interface CreateAsignDoctorToAppointment {
    userId: string;
    typeId: string; 
    date: string;
    time: string;
}

