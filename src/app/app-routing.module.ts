import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

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
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.default),
    canActivate: [], // Aquí puedes agregar un guard si es necesario
  },
  {
    path: 'appointment',
    loadChildren: () => import('./appointment/appointment.routes').then(m => m.default),
    canActivate: [], // Aquí puedes agregar un guard si es necesario
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [], // Aquí puedes agregar un guard si es necesario
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
