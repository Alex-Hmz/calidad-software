export interface Treatment {
  id: string;
  appointmentId: string;
  userId: string;
  treatmentName: string;
  treatmentDescription: string;
  treatmentDuration: number;
  createdAt: number;
  updatedAt?: number;
}

export interface CreateTreatment {
  appointmentId: string;
  userId: string;
  treatmentName: string;
  treatmentDescription: string;
  treatmentDuration: number;
  createdAt: number;
}

export interface UpdateTreatment {
  id: string;
  userId: string;
  treatmentName?: string;
  treatmentDescription?: string;
  treatmentDuration?: number;
  updatedAt: number;
}
