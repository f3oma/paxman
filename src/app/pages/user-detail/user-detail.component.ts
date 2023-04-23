import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, switchMap } from 'rxjs';
import { PaxUser } from 'src/app/models/users.model';
import { PaxManagerService } from 'src/app/services/pax-manager.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent {
  userDataSubject = new Subject<PaxUser | undefined>();
  userData$: Observable<PaxUser | undefined> = this.userDataSubject.asObservable();

  constructor(
    private readonly paxManagerService: PaxManagerService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id !== null) {
      this.getUserData(id);
    }
  }

  async getUserData(id: string) {
    this.userDataSubject.next(await (await this.paxManagerService.getDataByAuthId(id)).data());
  }
}
