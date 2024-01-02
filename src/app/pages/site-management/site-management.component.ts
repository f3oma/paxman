import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AOData } from 'src/app/models/ao.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';

@Component({
  selector: 'app-site-management',
  templateUrl: './site-management.component.html',
  styleUrls: ['./site-management.component.scss']
})
export class SiteManagementComponent {

  public displayedColumns: string[] = ['name', 'weekDay', 'startTimeCST', 'siteQ'];
  public tableData: AOData[] = [];
  public dataSource: any;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private aoManagerService: AOManagerService) {
    this.dataSource = null;
    this.getAOData();
  }

  async getAOData() {
    const tableData = await this.aoManagerService.getAllAOData();
    const dayMap = this.getDayMap();
    const sorted = tableData
      .filter((a) => a.weekDay !== '')
      .sort((a, b) => dayMap.get(a.weekDay) > dayMap.get(b.weekDay) ? 1 : -1);

    this.tableData = sorted;
    this.dataSource = new MatTableDataSource(this.tableData);
    this.dataSource.sort = this.sort;
  }

  private getDayMap() {
    const dayMap = new Map();
    dayMap.set('Mon', 0);
    dayMap.set('Tues', 1);
    dayMap.set('Wed', 2);
    dayMap.set('Thurs', 3);
    dayMap.set('Fri', 4);
    dayMap.set('Sat', 5);
    dayMap.set('Sun', 6);
    return dayMap;
  }
}
