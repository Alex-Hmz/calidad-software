import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FooterComponent } from './shared/components/footer/footer.component';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { getFunctions, provideFunctions } from '@angular/fire/functions';

@NgModule({
  declarations: [
    AppComponent,
    
    HeaderComponent, 
    FooterComponent, 
    HomeComponent, 
  
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    // ReactiveFormsModule,
    // InputTextModule,
    // ButtonModule,
    // ProgressSpinnerModule,
    // DatePickerModule,
    // CheckboxModule
  ],
  providers: [
      provideFirebaseApp(() => initializeApp({ 
        projectId: "agenda-medica-2ae34", 
        appId: "1:296884392563:web:b5334e3578c798d8d91006", 
        storageBucket: "agenda-medica-2ae34.firebasestorage.app", 
        apiKey: "AIzaSyD-NLIdWknqeybvmPbUxjR67-AOCOYgiM4", 
        authDomain: "agenda-medica-2ae34.firebaseapp.com", 
        messagingSenderId: "296884392563", 
        measurementId: "G-JET93KM5Z7" })),

    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    providePrimeNG({ 
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark'
        }
      },
    }),
      provideFunctions(() => getFunctions())
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
