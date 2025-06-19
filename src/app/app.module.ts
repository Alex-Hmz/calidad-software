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
  apiKey: "AIzaSyBKY2orctS4bEY2czaZAg2iEZTV391GK9Y",
  authDomain: "agenda-medica-cds.firebaseapp.com",
  projectId: "agenda-medica-cds",
  storageBucket: "agenda-medica-cds.firebasestorage.app",
  messagingSenderId: "895844089599",
  appId: "1:895844089599:web:e1eea3a496bbe2af4796ca",
  measurementId: "G-YKJ892KS75"
})),

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
