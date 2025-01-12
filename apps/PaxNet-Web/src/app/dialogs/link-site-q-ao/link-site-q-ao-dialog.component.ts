import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { BehaviorSubject, Observable, Subject, debounceTime, map } from "rxjs";
import { LocationSearchService } from "src/app/services/location-search.service";

@Component({
    selector: 'link-site-q-ao-dialog',
    templateUrl: 'link-site-q-ao-dialog.component.html',
  })
export class LinkSiteQAODialog {

    filteredLocationOptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
    filteredLocationOptions$: Observable<any[]> = this.filteredLocationOptionsSubject.asObservable();
    selectedLocation: any = '';

    form: FormGroup = new FormGroup({
        location: new FormControl('', [Validators.required])
    });
    
    constructor(
        public dialogRef: MatDialogRef<LinkSiteQAODialog>,
        private readonly locationSearchService: LocationSearchService
    ) {
        this.form.controls['location'].valueChanges.pipe(
        debounceTime(1000),
        map(async (value: string) => {
            if (value) {
                await this.updateLocationAutocompleteResults(value);
            }
            return [];
        })).subscribe();
    }
  
    private async updateLocationAutocompleteResults(partialLocationName: string): Promise<void> {
        const result = await this.findLocationByName(partialLocationName);
        const locations = result.map((res) => {
            return { 
                aoRef: res.path, 
                name: res.name 
            };
        });
        this.filteredLocationOptionsSubject.next(locations);
    }

    private async findLocationByName(partialLocationName: string): Promise<any[]> {
        return await this.locationSearchService.findByName(partialLocationName);
    }

    public displayLocationNameOptions(option: any) {
        return option.name;
    }

    public select() {
        if (this.form.valid) {
            const result = this.form.controls['location'].value;
            this.dialogRef.close(result)
        }
    }

    public cancel() {
        this.dialogRef.close();
    }
}

