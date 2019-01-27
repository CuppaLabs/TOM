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
    templateUrl:'./register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {

    newUser: any = {
        name: "",
        email: ""
    };
    qrCode: any = "";
    loading: any = false;
    success: Boolean = false;
    failure: Boolean = false;
    routeSub: any;
    loggedUser: any = {};
    errorMsg: string = "Oops !! Something went wrong. Try again !!";
    constructor(private router: Router, private appService: AppService,  private route: ActivatedRoute) {

    }
    ngOnInit(){
        if(sessionStorage.getItem("token") == "" || sessionStorage.getItem("token") == undefined){
            $('#exampleModal').modal('show');
        }
        if(sessionStorage.getItem("token")){
            this.getUserProfile();
        }
    }
    closeMsg(){
        this.success = false;
        this.failure = false;
    }
    register (){
        this.loading = true;
        this.appService.register({sessionId: '5b5a534e3b255947fc32b792'}).subscribe(res => {
            this.loading = false;
            this.qrCode = res.data;
            this.success = true;
            console.log(res);
        },error => {
            this.errorMsg = error.error.error;
            this.failure = true;
            this.loading = false;
        });
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

}