export interface UserProfile {
    name: string;
    email: string;
    birthdate: Date;
    phone: string;
    address: string;
    medicalConditions?: string;
    role: string;
    createdAt: Date;
}