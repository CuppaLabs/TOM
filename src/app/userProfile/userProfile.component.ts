import {Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AppService } from '../app.services'

@Component({
    templateUrl: './userProfile.component.html',
    styleUrls: ['./userProfile.component.css']
})
export class UserProfile implements OnInit {
    public userId: any;
    public user: any = {};
    public activities: any;
    public editUserDesc: boolean = false;
    constructor(private route: ActivatedRoute, private appService: AppService ){
        
    }
    ngOnInit(){
        this.route.params.subscribe((p:any) => {
            this.userId = p.id;
            this.getUserProfile(this.userId);
            this.getUserActivities(this.userId);
        });
    }
    getUserProfile(id:any) {
        this.appService.getUserProfileById(id).subscribe(
          res => {
            this.user = res;
            if(this.user.description == '' || this.user.description == undefined){
              this.user.description = "Edit to add your description"
            }
          },
          error => {
    
          }
        );
      }
      getUserActivities(id:any) {
        this.appService.getUserActivities(id).subscribe(
          res => {
            this.activities = res;
          },
          error => {
    
          }
        );
      }
      updateUser(){
        this.appService.updateUser(this.user, this.user._id).subscribe(res => {
          this.user = res;
          this.editUserDesc = false;
            if(this.user.description == '' || this.user.description == undefined){
              this.user.description = "Edit to add your description"
            }
        });
      }
}