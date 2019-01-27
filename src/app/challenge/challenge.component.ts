import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { EditorConfig } from '../editormd/director/model/editor-config';
import { AppService } from '../app.services';
import { EditorMdDirective } from '../editormd/director/editor-md.directive';
import { NgForm } from '@angular/forms';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';

@Component({
    templateUrl: 'challenge.component.html',
    styleUrls: ['challenge.component.css']
})
export class ChallengeComponent implements OnInit {
    conf = new EditorConfig();
    editorInstance: any;
    @ViewChild(EditorMdDirective) vc:EditorMdDirective; 
    challenge: any = {
        statement: "",
        category: "",
        description: ""
    };
    loading: any = false;
    success: Boolean = false;
    failure: Boolean = false;
    routeSub: any;
    loggedUser: any = {};
    errorMsg: string = "Oops !! Something went wrong. Try again !!";
    @ViewChild('fileform') form;
    public uploader:FileUploader;
    constructor(private router: Router, private appService: AppService,  private route: ActivatedRoute) {
        this.challenge = JSON.parse(sessionStorage.getItem('currentChallenge'));
        this.uploader = new FileUploader({url:'http://10.177.153.50:5000/upload/'+this.challenge._id});

    }
    ngOnInit(){
        
        this.getUserProfile();
    }
    goToDashboard() {
        this.router.navigate([{ outlets: { challengePopup: null } }]);
        //this.router.navigate(['/dashboard']);

    }
    getUserProfile() {
        this.appService.getUserProfile().subscribe(
            res => {
                this.loggedUser = Object.assign(this.loggedUser, res);
            },
            error => {

            }
        );
    }
    uploadFile(uploader){
     //   uploader.queue[0].file["email"] = this.loggedUser.email;
      //  uploader.queue[0].formData.push(this.challenge._id);
      uploader.onBuildItemForm = (fileItem: any, form: any) => {
        form.append('challengeid', this.challenge._id); //note comma separating key and value
       };
        console.log(uploader.queue[0].file);
        uploader.authToken = "Bearer "+sessionStorage.getItem('token');
        uploader.onSuccessItem = (item, response, status, headers) => this.onUploadSuccess(item, response, status, headers);
        uploader.onErrorItem  = (item, response, status, headers) => this.onUploadFail(item, response, status, headers);

        uploader.uploadAll();  
    }
    onUploadSuccess(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders){
        this.success = true;
        this.uploader = new FileUploader({url:'http://10.177.153.50:5000/upload/'+this.challenge._id});
        this.form.nativeElement.reset();
    }
    onUploadFail(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders){
        if(response){
            this.errorMsg = JSON.parse(response).error;
        }
        else {

        }
        this.failure = true;
        this.uploader = new FileUploader({url:'http://10.177.153.50:5000/upload/'+this.challenge._id});
        this.form.nativeElement.reset();
    }
    createChallenge(form: NgForm) {
        this.loading = true;
        this.appService.createChallenge(this.challenge).subscribe(res => {
            this.loading = false;
            this.success = true;
            form.resetForm();
            this.challenge.category = "";
        }, error => {
            this.loading = false;
            this.failure = true;
            form.resetForm();
            this.challenge.category = "";
        });
    }
    closeMsg(){
        this.success = false;
        this.failure = false;
    }
    onComplate(editorInstance: any) {
        this.editorInstance = editorInstance;

    }
}