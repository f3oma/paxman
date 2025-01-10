import { AfterViewChecked, Component, Input } from '@angular/core';
import { Beatdown, IBeatdown } from 'src/app/models/beatdown.model';

export enum IconSize {
  Large = "Large",
  Small = "Small",
}

@Component({
  selector: 'app-beatdown-category-chips',
  templateUrl: './beatdown-category-chips.component.html',
  styleUrls: ['./beatdown-category-chips.component.scss']
})
export class BeatdownCategoryChipsComponent {

  @Input('beatdown') beatdown!: Beatdown;
  @Input('iconSize') iconSize!: IconSize;

  constructor() {}
}
