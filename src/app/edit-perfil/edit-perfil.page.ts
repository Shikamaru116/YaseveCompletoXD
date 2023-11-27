import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-edit-perfil',
  templateUrl: './edit-perfil.page.html',
  styleUrls: ['./edit-perfil.page.scss'],
})
export class EditPerfilPage implements OnInit {
  uid: string;
  userData: any = {};

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.uid = await this.authService.getCurrentUserId();
    this.getUserData();
  }

  async getUserData() {
    this.userData = await this.firebaseSvc.getUserData(this.uid);
  }

  async updateProfile() {
    try {
      await this.firebaseSvc.updateUserProfile(this.uid, this.userData);
      this.utilsSvc.routerLink('/tabs/tab3');
      this.utilsSvc.presentToast({
        message: 'Perfil actualizado exitosamente, cierre sesion para ver los cambios',
        duration: 3500,
        color: 'success',
        position: 'middle'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      this.utilsSvc.presentToast({
        message: 'Hubo un error al actualizar el perfil',
        duration: 2000,
        color: 'danger',
        position: 'middle'
      });
    }
  }
}
