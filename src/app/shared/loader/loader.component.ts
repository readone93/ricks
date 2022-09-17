import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoaderService } from 'src/services/classes/loader/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {
  organizationLogo:string;
  loaderTxt:string = "Please Wait";
  status:any;
  constructor(private loaderService:LoaderService) { }

  ngOnInit() {
    this.loaderService.showLoader.subscribe(
      res => {
        this.status = res['show'];
        if(this.status){
          this.organizationLogo = environment.productLogoLarge;
        }
      }
    )
    
  }

  

}
