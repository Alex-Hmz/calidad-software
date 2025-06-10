import { Routes } from "@angular/router";

export default [
    // {
    //     path: 'list',
    //     loadChildren: () => import('./features/appointments/appointments.module').then(m => m.AppointmentsModule)
    // },
    {
        path: 'create/:id/:userId',
        loadChildren: () => import('./features/create/create.module').then(m => m.CreateModule)
    },
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    }
] as Routes