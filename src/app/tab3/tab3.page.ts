import { Component, inject } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Renderer2, ElementRef } from '@angular/core';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  isFullScreen: boolean = false;
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  userVideos: any[] = [];
  currentPlayingVideo: HTMLVideoElement | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private utilsService: UtilsService,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  // Carga los videos del usuario al iniciar la página
  async loadUserVideos() {
    const user = await this.auth.currentUser;
    if (user) {
      this.firestore.collection('videos', ref => ref.where('userId', '==', user.uid))
        .valueChanges()
        .pipe(
          switchMap((videos: any) => {
            this.userVideos = videos;
            // Puedes realizar acciones adicionales con otros datos si es necesario
            return this.firestore.collection('otrosDatos').valueChanges();
          })
        )
        .subscribe(
          (otrosDatos: any) => {
            // Puedes realizar acciones adicionales con otrosDatos si es necesario
          },
          (error) => {
            console.log('Error al cargar los datos:', error);
          }
        );
    }
  }

  ngOnInit() {
    this.loadUserVideos();
  }

  // Reproduce o pausa un video y ajusta su tamaño
  playAndToggle(videoURL: string, event: Event) {
    const videoElement = event.target as HTMLVideoElement;

    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play();
        videoElement.classList.add('enlarged');
      } else {
        videoElement.pause();
        videoElement.classList.remove('enlarged');
      }
    }

    // Restablece el tamaño de los demás videos
    const videoElements = document.querySelectorAll('.video-container video');
    videoElements.forEach((element: HTMLVideoElement) => {
      if (element !== videoElement) {
        element.classList.remove('enlarged');
      }
    });
  }

  // Reproduce o pausa un video y gestiona el estado del video actual
  playVideo(videoURL: string, event: Event) {
    const videoElement = event.target as HTMLVideoElement;

    if (this.currentPlayingVideo && this.currentPlayingVideo !== videoElement) {
      // Pausa el video actual si existe y no es el mismo que el nuevo video
      this.currentPlayingVideo.pause();
    }

    if (videoElement.paused) {
      videoElement.play();
      this.currentPlayingVideo = videoElement;
      videoElement.classList.add('enlarged');
    } else {
      videoElement.pause();
      videoElement.classList.remove('enlarged');
      this.currentPlayingVideo = null;
    }
  }

  // Cambia el tamaño de un video al hacer clic en él
  toggleVideoSize(videoURL: string) {
    const videoElements = document.querySelectorAll('.video-container video');

    videoElements.forEach((videoElement: HTMLVideoElement) => {
      if (videoElement.src !== videoURL) {
        // Pausa cualquier otro video que no sea el actual
        videoElement.pause();
        videoElement.classList.remove('enlarged');
      }
    });

    const clickedVideo = document.querySelector(`.video-container video[src="${videoURL}"]`);
    if (clickedVideo) {
      clickedVideo.classList.toggle('enlarged');
    }
  }

  // Amplía un video al hacer clic en su contenedor
  enlargeVideo(videoContainer: HTMLElement) {
    const allVideoContainers = this.el.nativeElement.querySelectorAll('.video-container');
    allVideoContainers.forEach((container: HTMLElement) => {
      this.renderer.removeClass(container, 'enlarged');
    });

    this.renderer.addClass(videoContainer, 'enlarged');
  }

  // Rearrange videos when needed
  rearrangeVideos() {
    const allVideoContainers = this.el.nativeElement.querySelectorAll('.video-container');
    allVideoContainers.forEach((container: HTMLElement, index: number) => {
      const isEnlarged = container.classList.contains('enlarged');
      const rowNumber = Math.floor(index / 2);

      if (isEnlarged) {
        container.style.width = '100%';
        container.style.order = 'unset';
      } else {
        container.style.width = 'calc(50% - 5px)';
        container.style.order = (rowNumber * 2 + 1).toString();
      }
    });
  }

  // Obtiene el usuario del servicio de utilidades
  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  // Redirige a una URL proporcionada
  redirectToLink(link: string) {
    window.location.href = link;
  }

  // Redirige a Facebook si el enlace está disponible
  redirectToFacebook() {
    const userData: any = this.user();
    if (userData && userData.facebook) {
      this.redirectToLink(userData.facebook);
    } else {
      console.log('No se encontró el enlace de Facebook');
    }
  }

  // Redirige a Instagram si el enlace está disponible
  redirectToInstagram() {
    const userData: any = this.user();
    if (userData && userData.instagram) {
      this.redirectToLink(userData.instagram);
    } else {
      console.log('No se encontró el enlace de Instagram');
    }
  }

  // Redirige a Twitter si el enlace está disponible
  redirectToTwitter() {
    const userData: any = this.user();
    if (userData && userData.twitter) {
      this.redirectToLink(userData.twitter);
    } else {
      console.log('No se encontró el enlace de Twitter');
    }
  }

  // Cierra la sesión del usuario
  signOut() {
    this.firebaseSvc.signOut().then(() => {
      this.utilsSvc.router.navigate(['/login']);
      console.log('Se cerró la sesión correctamente');
    }).catch(error => {
      console.log('Error al cerrar sesión:', error);
    });
  }
}
