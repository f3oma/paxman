import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { UserAuthenticationService } from "../services/user-authentication.service";
import { Observable } from "rxjs";
import { AuthenticatedUser, UserRole } from "../models/authenticated-user.model";

/*
  Use this auth guard for routes that require explicitly site-q + admin level privileges.
  If you're looking for Admin Only, look at admin-role.guard.ts
*/

@Injectable({
  providedIn: 'root',
})
export class SiteQMinimumRoleAuthGuard implements CanActivate {

  constructor(public authService: UserAuthenticationService, public router: Router) {}

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.authService.isLoggedIn && !this.authService.cachedCurrentAuthData) {
      this.goToLogin(state);
      return false;
    } else {
      const user: AuthenticatedUser | undefined = this.authService.cachedCurrentAuthData;
      if (user !== undefined) {
        const roles = user.roles;
        return roles.includes(UserRole.Admin) || roles.includes(UserRole.SiteQ);
      } else {
        // Maybe the current cachedCurrentAuthData is undefined?
        this.goToLogin(state);
        return false;
      }
    }
  }

  private async goToLogin(state: RouterStateSnapshot) {
    const queryParams = {
      from: state.url
    }
    await this.router.navigate(['login'], { queryParams });
  }
}
