import { Component, Input } from '@angular/core';
import { PhoneNumber } from 'src/app/models/phonenumber.model';
import { IPaxUser, PaxUser } from 'src/app/models/users.model';
import { PaxManagerService } from 'src/app/services/pax-manager.service';

@Component({
  selector: 'user-data-view',
  templateUrl: './user-data-view.component.html',
  styleUrls: ['./user-data-view.component.scss']
})
export class UserDataViewComponent {

  @Input('user') user!: IPaxUser; 
  public totalPaxCount: number = 2100 // non-zero in case it fails to load
  public ehUser: PaxUser | undefined = undefined;

  constructor(private paxManagerService: PaxManagerService) {
  }

  async ngOnInit() {
    this.totalPaxCount = await this.paxManagerService.getCachedCurrentNumberOfPax();
    this.getEhUserInformation();
  }

  async getEhUserInformation() {
    this.ehUser = this.user.ehByUserRef ? await this.paxManagerService.getPaxInfoByRef(this.user.ehByUserRef) : undefined;
  }

  public getPhoneNumber(phoneNumber: PhoneNumber | undefined) {
    return !phoneNumber ? '' : `tel:${phoneNumber.toCollapsedForm()}`;
  }
}
