export class PhoneNumber {
  constructor(public area: string, public exchange: string, public subscriber: string) {}

  public toDashedForm() {
    if(!this.area || !this.exchange || !this.subscriber) {
      return '';
    }
    return `${this.area}-${this.exchange}-${this.subscriber}`;
  }

  public toCollapsedForm() {
    if(!this.area || !this.exchange || !this.subscriber) {
      return '';
    }
    return `${this.area}${this.exchange}${this.subscriber}`;
  }
}
