import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserAuthenticationService } from '../services/user-authentication.service';
import { SiteQMinimumRoleAuthGuard } from './siteq-minimum-role.guard';

/*
  Use this auth guard for routes that allow only the current user (ex: profile edit)
  Allows Admins and Site-Q's to enter. Blocks user navigation otherwise
*/ 

@Injectable({
  providedIn: 'root',
})
export class PersonalProfileAuthGuard implements CanActivate {
  constructor(
    private authService: UserAuthenticationService,
    private router: Router,
    private siteQMinimumAuthGuard: SiteQMinimumRoleAuthGuard) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.siteQMinimumAuthGuard.canActivate(next, state)) {
        return true;
    } else {
        if (!this.authService.isLoggedIn && !this.authService.cachedCurrentAuthData) {
            const queryParams = {
                from: state.url
            }
            this.router.navigate(['login'], { queryParams });
            return false;
        } else {
            const user = this.authService.cachedCurrentAuthData;
            const targetedProfileId = next.params['id'];
            if (user?.paxDataId === targetedProfileId) {
                return true;
            } else {
                return false;
            }
        }
    }
  }
}
