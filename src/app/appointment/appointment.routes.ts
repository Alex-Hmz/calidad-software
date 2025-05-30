import { Routes } from "@angular/router";

export default [
    {
        path: 'list',
        loadChildren: () => import('./features/appointments/appointments.module').then(m => m.AppointmentsModule)
    },
    {
        path: 'create',
        loadChildren: () => import('./features/create-appointment/create-appointment.module').then(m => m.CreateAppointmentModule)
    },
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    }
] as Routes