import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { privateGuard, publicGuard } from './guards/auth.guard';

// import { AppointmentComponent } from './appointment/features/create-appointment/appointment.component';

// const routes: Routes = [
//   { path: '', redirectTo: 'login', pathMatch: 'full' }, // redirección por defecto
//   { path: 'login', component: LoginComponent },
//   { path: 'register', component: RegisterComponent },
//   { path: 'home', component: HomeComponent, },
//   { path: 'agendar', component: AppointmentComponent, },
// ];
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'

  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.default),
    // data: { roles: ['admin', 'patient'] },
    canActivate: [publicGuard], 
  },
    {
    path: 'users',
    loadChildren: () => import('./user/users.routes').then(m => m.default),
    data: { roles: ['admin', 'doctor'] },
    canActivate: [privateGuard], 
  },

  {
    path: 'appointment',
    loadChildren: () => import('./appointment/appointment.routes').then(m => m.default),
    data: { roles: ['admin', 'patient', 'doctor'] },
    canActivate: [privateGuard], 
  },
  {
    path: 'medical-record',
    loadChildren: () => import('./medical-record/medical-record.routes').then(m => m.default),
    data: { roles: ['admin', 'patient', 'doctor'] },
    canActivate: [privateGuard], 
  },
  {
    path: 'treatments',
    loadChildren: () => import('./treatments/treatments.routes').then(m => m.default),
    data: { roles: ['admin', 'patient', 'doctor'] },
    canActivate: [privateGuard], 
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin-panel/date-configt.routes').then(m => m.default),
    data: { roles: ['admin'] },
    canActivate: [privateGuard], 
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.routes').then(m => m.default),
    canActivate: [publicGuard], 
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
