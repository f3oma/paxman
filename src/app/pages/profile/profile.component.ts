import { Component } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { AuthenticatedUser } from "src/app/models/admin-user.model";
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
    public paxUserData$: Observable<IPaxUser | undefined> = new Observable();

    public editMode: boolean = false;

    constructor(
        private userAuthService: UserAuthenticationService,
        private readonly paxManagerService: PaxManagerService
    ) {
        this.authUserData$ = this.userAuthService.authUserData$.pipe(
            tap((data) => {
                const paxDataId = data?.getPaxDataId();
                if (paxDataId && paxDataId !== undefined) {
                    this.getPaxUserData(paxDataId);
                }
            })
        );
        this.paxUserData$ = this.userDataSubject.asObservable();
    }

    public toggleEditMode() {
        this.editMode = !this.editMode
    }
    
    public async saveData(user: IPaxUser) {
        console.log(user);
        await this.paxManagerService.updateUser(user);
        this.toggleEditMode();
    }

    private async getPaxUserData(id: string) {
        const paxData = await (await this.paxManagerService.getDataByAuthId(id)).data();
        this.userDataSubject.next(paxData?.toProperties());
    }

}