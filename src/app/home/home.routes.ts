import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadChildren: () => import('./home.module').then(m => m.HomeModule)
    }
] as Routes