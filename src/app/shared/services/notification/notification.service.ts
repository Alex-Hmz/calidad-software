import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import emailjs from '@emailjs/browser';
import { AppointmentEmailParams } from '../../models/notifications';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private sendEmail(params: any) {
    return emailjs.send(
      environment.emailjs.serviceID,
      environment.emailjs.templateID,
      params,
      environment.emailjs.publicKey
    );
  }

  send(appointmentEmailParams:AppointmentEmailParams) {

    
    return this.sendEmail({
      to_email: appointmentEmailParams.to_email,
      to_name: appointmentEmailParams.to_name,
      from_name: appointmentEmailParams.from_name,
      cita_fecha: appointmentEmailParams.cita_fecha,
      cita_hora: appointmentEmailParams.cita_hora,
      accion: appointmentEmailParams.accion,
      rol_actor: appointmentEmailParams.rol_actor,
      rol_receptor: appointmentEmailParams.rol_receptor,
      razon_cancelacion: appointmentEmailParams.razon_cancelacion,
      to_cc: appointmentEmailParams.to_cc,
      title: appointmentEmailParams.title
    });
  }

}
