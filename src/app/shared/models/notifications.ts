import { AppointmentStatusEnum } from "./enums";

export interface AppointmentEmailParams {
  to_name: string;
  to_email:string;
  from_name: string;
  cita_fecha: string;
  cita_hora: string;
  accion: AppointmentStatusEnum;
  rol_actor: 'paciente' | 'doctor' | 'admin';
  rol_receptor: 'paciente' | 'doctor';
  razon_cancelacion: string | null;
  to_cc: string | null;
  title: string;
}