export interface AppointmentType {
    id: string;
    specialtyId: string;
    name: string;
    price: number;
    isValid: boolean;
    createdAt: Date;
    updatedAt: Date;
}