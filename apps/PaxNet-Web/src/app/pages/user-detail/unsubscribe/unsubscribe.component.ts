import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaxManagerService } from 'src/app/services/pax-manager.service';

@Component({
  selector: 'app-unsubscribe',
  templateUrl: './unsubscribe.component.html',
  styleUrls: ['./unsubscribe.component.scss']
})
export class UnsubscribeComponent {

  // If we get here, we want to update the user's email preferences to
  // no emails. "https://pax.f3omaha.com/users/<id>/unsubscribe?email=true";
  constructor(
    private paxManagerService: PaxManagerService,
    private activatedRoute: ActivatedRoute
    ) {
  }

  async ngOnInit() {
    const isValid = this.activatedRoute.snapshot.queryParamMap.get('email');
    if (isValid === 'true') {
      const id = this.activatedRoute.snapshot.paramMap.get('id');
      if (id !== null) {
        await this.updateUserEmailPreferences(id);
      }
    }
  }

  async updateUserEmailPreferences(id: string) {
    await this.paxManagerService.unsubscribeEmailsForUser(id);
  }
}
