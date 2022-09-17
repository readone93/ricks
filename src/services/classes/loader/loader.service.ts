import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  showLoader: BehaviorSubject<{ show:boolean}> = new BehaviorSubject<{ show:boolean}>({ show:false})

  constructor() { }

  show(){
    this.showLoader.next({show:true})
  }

  hide(){
    this.showLoader.next({show:false})
  }
}
