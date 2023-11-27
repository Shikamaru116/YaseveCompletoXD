import { Injectable,inject } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, UserCredential} from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { User } from '../models/user.model';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {getFirestore, setDoc, doc} from '@angular/fire/firestore';
import { getDoc } from 'firebase/firestore';
import { UtilsService } from './utils.service';
import 'firebase/compat/auth';
import firebase from 'firebase/compat/app';
import { AngularFireStorage } from '@angular/fire/compat/storage';




@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private videosCollection: AngularFirestoreCollection<any>; // Asegúrate de que sea del tipo correspondiente

  constructor(
    private storage: AngularFireStorage,
  ) {
    this.videosCollection = this.firestore.collection('videos');
  }
  private userName: string;
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);

  setUserName(name: string): void {
    this.userName = name;
  }
  getUserName(): string {
    return this.userName;
  }
    getAuth(){
      return getAuth();
    }
  //auth
  signIn(user: User){
    return signInWithEmailAndPassword(getAuth(),user.email,user.password);
  }
//crear usuario
  signUp(user: User){
    return createUserWithEmailAndPassword(getAuth(),user.email,user.password);
  }
  updateUser(displayName: string){
    return updateProfile(getAuth().currentUser,{displayName});
  }
  signOut(){

    return getAuth().signOut();
  }
  //----------database------------
  setDocument(path:string, data:any){
    return setDoc(doc(getFirestore(),path),data);
  }
  async getDocument(path:string){
    return (await getDoc(doc(getFirestore(),path))).data();
  }


  loginwithGoogle() {
    return this.auth.signInWithPopup(new GoogleAuthProvider());
  }

  storeUserData(userCredential: firebase.auth.UserCredential) {
    const { user } = userCredential; // Obtén el usuario desde el UserCredential

    // Ahora puedes acceder a la información del usuario para almacenarla en tu base de datos
    const userData = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      // Otros datos que quieras almacenar...
    };

    const path = `Users/${user.uid}`; // Ruta donde guardar los datos

    return this.setDocument(path, userData); // Almacena los datos en Firestore
  }
  async uploadFile(filePath: string, file: File): Promise<string | null> {
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, file);

    try {
      await uploadTask;
      const downloadURL = await fileRef.getDownloadURL().toPromise();
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }

  async updateUserProfile(uid: string, userData: any) {
    const path = `Users/${uid}`;
    try {
      await this.setDocument(path, userData);
      return true; // o algún indicador de éxito
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false; // o manejar el error de alguna manera
    }
  }
  async getUserData(userId: string): Promise<User | null> {
    try {
      const userSnapshot = await this.firestore.collection('Users').doc(userId).get().toPromise();
      if (userSnapshot.exists) { // Revisa si el documento existe usando la propiedad exists
        const userData = userSnapshot.data() as User;
        // Asegúrate de que userData tenga las propiedades requeridas por la interfaz User
        return userData;
      } else {
        console.error('No se encontraron datos para el usuario con el UID:', userId);
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      return null;
    }
  }



  async getAllUsers(): Promise<User[]> {
    try {
      const usersSnapshot = await this.firestore.collection('Users').get().toPromise();
      const users = usersSnapshot.docs.map(doc => doc.data() as User);
      console.log('Usuarios obtenidos:', users); // Mostrar los usuarios en la consola
      return users;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const currentUser = await this.auth.currentUser;
      if (currentUser) {
        const userSnapshot = await this.firestore.collection('Users').doc(currentUser.uid).get().toPromise();
        const userData = userSnapshot.data() as User;
        console.log('Usuario actual:', userData); // Mostrar el usuario actual en la consola
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
      return null;
    }
  }

  async getVideosByUserId(userId: string): Promise<any[]> {
    try {
      const query = this.videosCollection.ref.where('userId', '==', userId);
      const videosSnapshot = await query.get();
      const videos = videosSnapshot.docs.map(doc => doc.data());
      console.log('Videos del usuario con ID', userId, ':', videos);
      return videos;
    } catch (error) {
      console.error('Error al obtener los videos del usuario con ID', userId, ':', error);
      return [];
    }
  }


}



