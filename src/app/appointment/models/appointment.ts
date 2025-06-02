
export enum AppointmentType {
    Confirmada = 'Confirmada',
    Pendiente = 'Pendiente',
    Cancelada = 'Cancelada'
}

export interface Appointment {
    id: string;           
    userId: string;
    date: string;
    time: string;
    reason: string;
    estado: AppointmentType;
    createdAt: number;
}

export interface CreateAppointment {
    userId: string;
    date: string;
    time: string;
    reason: string;
    estado: AppointmentType;
    createdAt: number;
}