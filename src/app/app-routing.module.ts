import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'registrer',
    loadChildren: () => import('./registrer/registrer.module').then( m => m.RegistrerPageModule)
  },
  {
    path: 'edit-perfil',
    loadChildren: () => import('./edit-perfil/edit-perfil.module').then( m => m.EditPerfilPageModule)
  },
  {
    path: 'upload-video',
    loadChildren: () => import('./upload-video/upload-video.module').then( m => m.UploadVideoPageModule)
  },

  {
    path: 'user-perfil/:userId',
    loadChildren: () => import('./user-perfil/user-perfil.module').then( m => m.UserPerfilPageModule)
  },


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
