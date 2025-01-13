import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { AuthenticatedUser } from "src/app/models/authenticated-user.model";
import { PhoneNumber } from "src/app/models/phonenumber.model";
import { IPaxUser, PaxUser } from "src/app/models/users.model";
import { PaxManagerService } from "src/app/services/pax-manager.service";
import { UserAuthenticationService } from "src/app/services/user-authentication.service";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

    public authUserData$: Observable<AuthenticatedUser | undefined>;
    public userDataSubject: BehaviorSubject<IPaxUser | undefined> = new BehaviorSubject<IPaxUser | undefined>(undefined);
    public paxUserData$: Observable<IPaxUser | undefined> = this.userDataSubject.asObservable();

    public editMode: boolean = false;

    constructor(
        private userAuthService: UserAuthenticationService,
        private readonly paxManagerService: PaxManagerService,
        private route: ActivatedRoute
    ) {
        this.route.queryParams.subscribe(async (routeParams) => {
            if (routeParams['edit']) {
              this.editMode = true;
            }
        });
        this.authUserData$ = this.userAuthService.authUserData$.pipe(
            tap(async (data) => {
                const paxDataId = data?.paxDataId;
                if (paxDataId && paxDataId !== undefined) {
                    await this.getPaxUserData(paxDataId);
                }
            })
        );
    }

    public toggleEditMode() {
        this.editMode = !this.editMode
    }
    
    private async getPaxUserData(id: string) {
        const paxData = await (await this.paxManagerService.getDataByAuthId(id)).data();
        this.userDataSubject.next(paxData?.toProperties());
    }
}