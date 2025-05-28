export interface Appointment {
    id?: string;           
    userId: string;
    date: string;
    time: string;
    reason: string;
    estado: 'Confirmada' | 'Pendiente' | 'Cancelada';
    createdAt: number;
}