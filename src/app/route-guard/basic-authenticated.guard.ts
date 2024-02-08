import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserAuthenticationService } from '../services/user-authentication.service';

/*
  Use this auth guard for routes that require a logged in user. 
  Blocks user navigation and routes to login.
*/

@Injectable({
  providedIn: 'root',
})
export class BasicAuthenticatedAuthGuard  {
  constructor(public authService: UserAuthenticationService, public router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isLoggedIn !== true && !this.authService.cachedCurrentAuthData) {
       const queryParams = {
        from: state.url
      }
      this.router.navigate(['login'], { queryParams });
    }
    return true;
  }
}
