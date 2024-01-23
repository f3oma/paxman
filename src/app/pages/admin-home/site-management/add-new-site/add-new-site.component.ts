import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IAOData } from 'src/app/models/ao.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';

@Component({
  selector: 'app-add-new-site',
  templateUrl: './add-new-site.component.html',
  styleUrls: ['./add-new-site.component.scss']
})
export class AddNewSiteComponent {

  public site: IAOData;

  constructor(private aoManagerService: AOManagerService, private router: Router) {
    const newDefaultSite = this.aoManagerService.defaultNewAO;
    this.site = newDefaultSite.toProperties();
  }

  async navigateToSite() {
    await this.router.navigate(['admin/site-management', this.site.id]);
  }

  async navigateBack() {
    await this.router.navigate(['admin/site-management']);
  }
}
