import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddPaxComponent } from './pages/add-pax/add-pax.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { SearchComponent } from './pages/search/search.component';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';
import { ClaimPaxInfoComponent } from './pages/claim-pax-info/claim-pax-info.component';
import { AuthGuard } from './route-guard/auth-guard.guard';
import { ProfileComponent } from './pages/profile/profile.component';

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
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'claim-info',
    component: ClaimPaxInfoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
