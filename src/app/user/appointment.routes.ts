import { Routes } from "@angular/router";

export default [
    {
        path: 'list',
        loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
    },
    {
        path: 'create',
        loadChildren: () => import('./features/user-form/user-form.module').then(m => m.UserFormModule)
    },
    {
        path: 'edit/:id',
        loadChildren: () => import('./features/user-form/user-form.module').then(m => m.UserFormModule)
    },
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    }
] as Routes