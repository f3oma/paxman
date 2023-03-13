import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddPaxComponent } from './pages/add-pax/add-pax.component';
import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'add-pax',
    component: AddPaxComponent
  },
  {
    path: 'search',
    component: SearchComponent
  },
  {
    path: 'users/:id',
    component: UserDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
