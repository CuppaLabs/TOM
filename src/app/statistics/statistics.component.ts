import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { EditorConfig } from '../editormd/director/model/editor-config';
import { AppService } from '../app.services';
import { EditorMdDirective } from '../editormd/director/editor-md.directive';
import { NgForm } from '@angular/forms';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';

declare var $: any;

@Component({
    templateUrl:'./statistics.component.html',
    styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent {

    newUser: any = {
        name: "",
        email: ""
    };
    qrCode: any = "";
    data: any;
    loggedUser: any = {};
    constructor(private router: Router, private appService: AppService,  private route: ActivatedRoute) {

    }
    ngOnInit(){

        if(sessionStorage.getItem("token")){
            this.getUserProfile();
        }
        this.getStatistics();
    }
    getUserProfile() {
        this.appService.getUserProfile().subscribe(
            res => {
                this.newUser = Object.assign(this.newUser, res);
                this.qrCode = this.newUser.qrcode;
            },
            error => {

            }
        );
    }
    getStatistics(){
        this.appService.getStatistics().subscribe(res => {
            this.data = res;
        });
    }

}