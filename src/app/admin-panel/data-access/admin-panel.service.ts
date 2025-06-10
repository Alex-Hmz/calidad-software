import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, CollectionReference, getDocs, query, where } from '@angular/fire/firestore';

export interface FreeDay {
  id:string;
  date: string;
  reason: string;
  createdAt: number;
}
export interface CreateFreeDay {
  date: string;
  reason: string;
  createdAt: number;
}
@Injectable({
  providedIn: 'root'
})
export class AdminPanelService {
  private freeDaysRef: CollectionReference;

  constructor(private firestore: Firestore) {
    this.freeDaysRef = collection(this.firestore, 'freeDays');
  }

  async createFreeDay(freeDay: CreateFreeDay): Promise<string> {
    // Check if the date is already banned
    const q = query(
      this.freeDaysRef,
      where('date', '==', freeDay.date)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error('Este día ya está bloqueado.');
    }
    const docRef = await addDoc(this.freeDaysRef, freeDay);
    return docRef.id;
  }

  async getFreeDaysByYear(year: number): Promise<FreeDay[]> {
    // Assumes freeDay.date is stored as 'YYYY-MM-DD'
    const yearStr = year.toString();
    const q = query(
      this.freeDaysRef,
      where('date', '>=', `${yearStr}-01-01`),
      where('date', '<=', `${yearStr}-12-31`)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FreeDay));
  }
}
