import { AfterViewChecked, Component } from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";
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
export class ProfileComponent implements AfterViewChecked {

    public authUserData$: Observable<AuthenticatedUser | undefined>;
    public userDataSubject: BehaviorSubject<IPaxUser | undefined> = new BehaviorSubject<IPaxUser | undefined>(undefined);
    public paxUserData$: Observable<IPaxUser | undefined> = this.userDataSubject.asObservable();

    public editMode: boolean = false;

    constructor(
        private userAuthService: UserAuthenticationService,
        private readonly paxManagerService: PaxManagerService
    ) {
        this.authUserData$ = this.userAuthService.authUserData$.pipe(
            tap(async (data) => {
                const paxDataId = data?.getPaxDataId();
                if (paxDataId && paxDataId !== undefined) {
                    await this.getPaxUserData(paxDataId);
                }
            })
        );
    }

    public ngAfterViewChecked() {
        
    }

    public toggleEditMode() {
        this.editMode = !this.editMode
    }
    
    public async saveData(user: IPaxUser) {
        await this.paxManagerService.updateUser(user);
        this.toggleEditMode();
    }

    public updateHideContactInfoValue($event: MatCheckboxChange, user: IPaxUser) {
        user.hideContactInformation = $event.checked;
    }

    public updateActiveStatusValue($event: MatCheckboxChange, user: IPaxUser) {
        user.activeUser = $event.checked;
    }

    private async getPaxUserData(id: string) {
        const paxData = await (await this.paxManagerService.getDataByAuthId(id)).data();
        console.log(paxData);
        this.userDataSubject.next(paxData?.toProperties());
    }


}