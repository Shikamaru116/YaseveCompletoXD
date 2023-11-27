import { Component, OnInit, Inject } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../models/user.model';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-registrer',
  templateUrl: './registrer.page.html',
  styleUrls: ['./registrer.page.scss'],
})
export class RegistrerPage implements OnInit {
  uid: string;
  username: string;
  email: string = '';
  empleo: string = '';
  estudios: string = '';
  servicios: string = '';
  descripcion: string = '';
  password: string = '';
  name: string = '';
  selectedFile: File = null;
  downloadURL: string = null;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {}

  isFormValid(): boolean {
    return !!(
      this.email &&
      this.password &&
      this.name &&
      this.empleo &&
      this.estudios &&
      this.servicios &&
      this.username &&
      this.descripcion
    );
  }

  ngOnInit() {}

  async submit() {
    if (this.isFormValid()) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        const res = await this.firebaseSvc.signUp({
          email: this.email,
          password: this.password,
          name: this.name,
          servicios: this.servicios,
          empleo: this.empleo,
          estudios: this.estudios,
          username: this.username,
          descripcion: this.descripcion
        } as User);

        this.uid = res.user.uid;
        await this.uploadFile(); // Subir archivo al Storage
        await this.setUserInfo(this.uid);

        loading.dismiss();
        this.utilsSvc.routerLink('/login');
        this.utilsSvc.presentToast({
          message: 'Inicie sesion para ingresar',
          duration: 1500,
          color: 'success',
          position: 'middle'
        });
      } catch (error) {
        console.log(error);
        loading.dismiss();
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2000,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      }
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  async uploadFile() {
    if (this.selectedFile) {
      const filePath = `profileImages/${this.uid}/${this.selectedFile.name}`;
      const uploadTask = await this.firebaseSvc.uploadFile(filePath, this.selectedFile);

      if (uploadTask !== null) {
        this.downloadURL = uploadTask;
        console.log('Download URL:', this.downloadURL);
      } else {
        console.error('Failed to upload file.');
      }
    }
  }

  async setUserInfo(uid: string) {
    const path = `Users/${uid}`;
    const userData = {
      name: this.name,
      email: this.email,
      empleo: this.empleo,
      estudios: this.estudios,
      servicios: this.servicios,
      username: this.username,
      profileImageURL: this.downloadURL, // Agregar la URL de descarga de la imagen al objeto userData
    };

    try {
      await this.firebaseSvc.setDocument(path, userData);
      this.utilsSvc.saveInLocalStorage('Users', {
        uid,
        email: this.email,
        password: this.password,
        name: this.name,
        servicios: this.servicios,
        empleo: this.empleo,
        estudios: this.estudios,
        username: this.username,
      });
    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 5500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
    }
  }
}
