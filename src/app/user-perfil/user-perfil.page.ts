import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Renderer2, ElementRef } from '@angular/core';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-user-perfil',
  templateUrl: './user-perfil.page.html',
  styleUrls: ['./user-perfil.page.scss'],
})


export class UserPerfilPage implements OnInit {
  userId: string;
  userProfile: any; // Puedes definir la estructura adecuada para el perfil del usuario
  userVideos: any[] = [];
  currentPlayingVideo: HTMLVideoElement | null = null;

  constructor(
    private route: ActivatedRoute,
    private auth: AngularFireAuth,
    private renderer: Renderer2,
    private el: ElementRef,
    private firestore: AngularFirestore,
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.getUserProfile();
  }

  getUserProfile() {
    this.firestore
      .collection('Users')
      .doc(this.userId)
      .valueChanges()
      .subscribe((userData: any) => {
        if (userData) {
          this.userProfile = userData;
          // Asegurarse de que existe un userId en el perfil antes de cargar los videos
          if (this.userId) {
            this.loadUserVideos(this.userId);
          }
        }
      });
  }
  
  loadUserVideos(userId: string) {
    this.firestore.collection('videos', ref => ref.where('userId', '==', userId))
      .valueChanges()
      .subscribe(
        (videos: any) => {
          this.userVideos = videos;
        },
        (error) => {
          console.log('Error al cargar los videos:', error);
        }
      );
  }
  
  
  

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

  redirectToLink(link: string) {
    // Agrega lógica para redireccionar a la URL proporcionada
    window.open(link, '_blank');
  }
}
