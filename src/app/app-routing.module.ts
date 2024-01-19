import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddPaxComponent } from './pages/add-pax/add-pax.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { SearchComponent } from './pages/search/search.component';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';
import { ClaimPaxInfoComponent } from './pages/claim-pax-info/claim-pax-info.component';
import { BasicAuthenticatedAuthGuard } from './route-guard/basic-authenticated.guard';
import { ProfileComponent } from './pages/profile/profile.component';
import { SiteManagementComponent } from './pages/admin-home/site-management/site-management.component';
import { SiteDetailComponent } from './pages/admin-home/site-management/site-detail/site-detail.component';
import { AdminRoleAuthGuard } from './route-guard/admin-role.guard';
import { SiteQMinimumRoleAuthGuard } from './route-guard/siteq-minimum-role.guard';
import { PersonalProfileAuthGuard } from './route-guard/personal-profile.guard';
import { AdminHomeComponent } from './pages/admin-home/admin-home.component';
import { AdminPaxListComponent } from './pages/admin-home/admin-pax-list/admin-pax-list.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AdminUserDetailComponent } from './pages/admin-home/admin-user-detail/admin-user-detail.component';

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
    path: 'search',
    component: SearchComponent
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
    path: 'add-pax',
    component: AddPaxComponent,
    canActivate: [BasicAuthenticatedAuthGuard]
  },
  {
    path: 'claim-info',
    component: ClaimPaxInfoComponent,
    canActivate: [BasicAuthenticatedAuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [BasicAuthenticatedAuthGuard]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [BasicAuthenticatedAuthGuard]
  },
  {
    path: 'users/:id',
    component: UserDetailComponent,
    canActivate: [BasicAuthenticatedAuthGuard]
  },
  {
    path: 'admin',
    canActivate: [SiteQMinimumRoleAuthGuard],
    children: [
      {
        path: '',
        component: AdminHomeComponent,
      },
      {
        path: 'site-management',
        component: SiteManagementComponent,
        canActivate: [SiteQMinimumRoleAuthGuard]
      },
      {
        path: 'site-management/:id',
        component: SiteDetailComponent,
        canActivate: [SiteQMinimumRoleAuthGuard]
      },
      {
        path: 'pax-list',
        component: AdminPaxListComponent,
        canActivate: [AdminRoleAuthGuard]
      },
      {
        path: 'user-data-edit',
        component: AdminUserDetailComponent,
        canActivate: [AdminRoleAuthGuard]
      },
      {
        path: 'user-data-edit/:id',
        component: AdminUserDetailComponent,
        canActivate: [AdminRoleAuthGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
