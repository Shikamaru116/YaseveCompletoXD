import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {

  @ViewChild('videoContainer') videoContainer: ElementRef;

  // Variables para almacenar datos
  backgroundImage: string;
  userProfileImage: string;
  username: string;
  description: string;
  videos: any[] = [];
  lastActiveVideo: HTMLVideoElement | null = null;
  observer: IntersectionObserver | null = null;
  hashtag: string[] = [];


  constructor(private afs: AngularFirestore, private el: ElementRef) {}

  ngOnInit() {
    // Recuperar datos de Firestore para la colección 'videos'
    this.afs.collection('videos').valueChanges().subscribe((videosData: any) => {
      // Verificar si videosData no es nulo
      if (videosData) {
        // Asignar el arreglo de videos
        this.videos = videosData;

        // Inicializar los reproductores de video y el observador de intersección
        setTimeout(() => this.initializeVideoPlayers(), 0);

        // Recuperar información del usuario para cada video
        this.videos.forEach(video => {
          this.afs.collection('Users').doc(video.userId).valueChanges().subscribe((userData: any) => {
            // Verificar si userData no es nulo
            if (userData) {
              // Asignar la información del usuario al video
              video.userProfileImage = userData.profileImageURL || ''; // Asignar la imagen de perfil del usuario
              video.username = userData.username || ''; // Asignar el nombre de usuario del usuario
            }
          });
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  initializeVideoPlayers() {
    // Crear un observer para detectar la intersección con los elementos de video
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Video está visible, reproducirlo
          const video = entry.target as HTMLVideoElement;
          video.play();
          this.lastActiveVideo = video;
        } else {
          // Video no es visible, pausarlo
          const video = entry.target as HTMLVideoElement;
          video.pause();
        }
      });
    }, { threshold: 0.5 }); // Ajustar el umbral según sea necesario

    // Obtener todos los elementos de video y observarlos
    const videoPlayers = this.videoContainer.nativeElement.querySelectorAll('video');
    videoPlayers.forEach(video => {
      this.observer.observe(video);
      video.addEventListener('ended', () => this.onVideoEnded(video));
    });
  }

  togglePlayPause(video: HTMLVideoElement) {
    if (video.paused) {
      video.play();
      this.lastActiveVideo = video;
    } else {
      video.pause();
    }
  }

  onVideoEnded(video: HTMLVideoElement) {
    // Reiniciar el video cuando llega al final
    video.currentTime = 0;
    this.lastActiveVideo = null;
  }
}


