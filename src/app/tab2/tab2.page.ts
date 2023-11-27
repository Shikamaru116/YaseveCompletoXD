import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  currentUser: { uid: string } | null = null;
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';

  constructor(private firebaseSvc: FirebaseService, private router: Router) {
    this.getUsers();
  }

  async getUsers() {
    try {
      this.users = await this.firebaseSvc.getAllUsers();
      const currentUserAuth = await this.firebaseSvc.getAuth().currentUser;

      if (currentUserAuth) {
        this.currentUser = {
          uid: currentUserAuth.uid,
        };
        this.filterUsers();
      } else {
        console.error('No hay usuario autenticado.');
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value.trim().toLowerCase();
    this.filterUsers();
  }

  filterUsers() {
    this.filteredUsers = this.users
      .filter(user => {
        const username = user.username.toLowerCase();
        return username.includes(this.searchTerm) && user.uid !== this.currentUser?.uid;
      })
      .map(user => {
        return {
          ...user,
          uid: user.uid // Asegura que 'uid' esté presente en el objeto usuario
        };
      });
  }


  viewUserProfile(user: User) {
    console.log('Usuario seleccionado:', user);
    if (user && user.uid !== undefined && user.uid !== null) {
      this.navigateToUserProfile(user.uid); // Cambié el nombre del método
    } else {
      console.error('El usuario o su ID son indefinidos.');
      console.log('Objeto usuario completo:', user);
    }
  }

  navigateToUserProfile(userId: string) {
    this.router.navigate(['/user-perfil', userId]);
  }
}
