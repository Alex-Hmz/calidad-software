import { Routes } from "@angular/router";

export default [
    {
        path: 'login',
        loadChildren: () => import('./features/login/login.module').then(m => m.LoginModule)
    },
    {
        path: 'register',
        loadChildren: () => import('./features/register/register.module').then(m => m.RegisterModule)
    },
    {
        path: 'register-doctor',
        loadChildren: () => import('./features/doctor-register/doctor-register.module').then(m => m.DoctorRegisterModule)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
] as Routes