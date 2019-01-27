import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from './app.services'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Theme of the month';
  constructor(private router: Router, private appService: AppService) {

  }
  onDeactivate(evt: any){
    this.appService.announceMission("posts");
  }
  onArticleDeactivate() {
    this.appService.announceMission("articles");
  }
}
