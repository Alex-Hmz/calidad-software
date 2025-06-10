import { Routes } from "@angular/router";

export default [
    {
        path: 'date-config',
        loadChildren: () => import('./features/date-config/date-config.module').then(m => m.DateConfigModule)
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
        redirectTo: 'date-config',
        pathMatch: 'full'
    }
] as Routes