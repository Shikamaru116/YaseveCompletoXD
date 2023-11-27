import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}

  getCurrentUserId(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.afAuth.onAuthStateChanged(user => {
        if (user) {
          resolve(user.uid);
        } else {
          resolve(null);
        }
      }, error => {
        reject(error);
      });
    });
  }
}
