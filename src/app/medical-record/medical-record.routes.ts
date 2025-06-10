import { Routes } from "@angular/router";

export default [
    {
        path: ':id',
        loadChildren: () => import('./features/medical-record/medical-record.module').then(m => m.MedicalRecordModule)
    },
    // {
    //     path: 'create',
    //     loadChildren: () => import('./features/create-appointment/create-appointment.module').then(m => m.CreateAppointmentModule)
    // },
    // {
    //     path: 'edit/:id',
    //     loadChildren: () => import('./features/create-appointment/create-appointment.module').then(m => m.CreateAppointmentModule)
    // },
    {
        path: '',
        redirectTo: '/:id',
        pathMatch: 'full'
    }
] as Routes