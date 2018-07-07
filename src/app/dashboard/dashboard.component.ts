
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { EditorConfig } from '../editormd/director/model/editor-config';
import { Router } from '@angular/router';
import { AppService } from '../app.services'

declare var $: any;
declare var $: any;

@Component({
    selector: 'dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.css']
})
export class Dashboard implements OnInit {

    conf = new EditorConfig();
    editorInstance: any;
    user: any = { email: "", password: "" };
    isLoggedIn = false;
    posts: any = [];
    articles: any = [];
    users: any = [];
    loggedUser: any = {};
    toloc: any = '';
    constructor(private router: Router, private appService: AppService) {

    }
    ngOnInit() {
        this.appService.getArticles().subscribe(
            res => {
                this.articles = res;
            },
            error => {

            }
        );
        this.appService.getPosts().subscribe(
            res => {
                this.posts = res;
            },
            error => {

            }
        );
        this.appService.getUsers().subscribe(
            res => {
                this.users = res;
            },
            error => {

            }
        );
        this.getUserProfile();
        if (sessionStorage.getItem("token")) {
            this.isLoggedIn = true;
        }
    }
    openPostModal() {
        if (this.isLoggedIn) {
            this.router.navigate([{ outlets: { postPopup: ['post'] } }]);
        }
        else {
            this.toloc = 'post';
            $('#exampleModal').modal('show')
        }
    }
    openArticleModal() {
        if (this.isLoggedIn) {
            this.router.navigate([{ outlets: { articlePopup: ['article'] } }]);
        }
        else {
            this.toloc = 'article';
            $('#exampleModal').modal('show')
        }
    }
    onComplate(editorInstance: any) {
        this.editorInstance = editorInstance;
    }
    login() {
        this.appService.login(this.user).subscribe(
            res => {
                console.log(res);
                $('#exampleModal').modal('hide')
                sessionStorage.setItem("token", res.token);
                this.isLoggedIn = true;
                this.getUserProfile();
                if(this.toloc == 'post'){
                    this.router.navigate([{ outlets: { postPopup: ['post'] } }]);
                }
                else if(this.toloc == 'article'){
                    this.router.navigate([{ outlets: { articlePopup: ['article'] } }]);
                }
            },
            error => {

            }
        );
    }
    logout() {
        sessionStorage.clear();
        this.isLoggedIn = false;
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

}