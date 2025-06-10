import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { HeaderModule } from './shared/components/header/header.module';
import { FooterModule } from './shared/components/footer/footer.module';
import { SidebarModule } from './shared/components/sidebar/sidebar.module';
import { MedicalRecordComponent } from './medical-record/features/medical-record/medical-record.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HeaderModule, 
    FooterModule,
    SidebarModule

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
