import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private requests = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  show() {
    this.requests++;
    if (this.requests === 1) {
      this.loadingSubject.next(true);
    }
  }

  hide() {
    if (this.requests > 0) this.requests--;
    if (this.requests === 0) {
      this.loadingSubject.next(false);
    }
  }

  reset() {
    this.requests = 0;
    this.loadingSubject.next(false);
  }
}
