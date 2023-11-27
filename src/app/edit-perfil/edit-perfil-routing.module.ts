import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditPerfilPage } from './edit-perfil.page';

const routes: Routes = [
  {
    path: '',
    component: EditPerfilPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditPerfilPageRoutingModule {}
