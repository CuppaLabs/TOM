
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { EditorConfig } from '../editormd/director/model/editor-config';
import { Router } from '@angular/router';
import { AppService } from '../app.services'
import { DomSanitizer } from '@angular/platform-browser';
import { BootstrapOptions } from '@angular/core/src/application_ref';
import { NgForm } from '@angular/forms';

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
    selectedPost: any = {};
    readPost: boolean = false;
    newUser: any = {
        email: "",
        name: "",
        password: ""
    };
    success: Boolean = false;
    failure: Boolean = false;
    showTimeline: Boolean = true;
    loading: Boolean = false;
    constructor(private router: Router, private appService: AppService, private sanitizer: DomSanitizer) {
    }

    ngOnInit() {
        this.animateBalloons();
        this.appService.missionAnnounced$.subscribe(
            mission => {
                if(mission == "posts"){
                    this.loadPosts();
                }
                if(mission == "articles"){
                    this.loadArticles();
                }
                
            });
        this.loadArticles();
        this.loadPosts();
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
    loadPosts() {
        this.appService.getPosts().subscribe(
            res => {
                this.posts = res;
            },
            error => {

            }
        );
    }
    loadArticles() {
        this.appService.getArticles().subscribe(
            res => {
                this.articles = res;
            },
            error => {

            }
        );
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
        this.loading = true;
        this.user.password = this.user.email;
        this.appService.login(this.user).subscribe(
            res => {
                this.loading = false;
                console.log(res);
                $('#exampleModal').modal('hide')
                sessionStorage.setItem("token", res.token);
                this.isLoggedIn = true;
                this.getUserProfile();
                if (this.toloc == 'post') {
                    this.router.navigate([{ outlets: { postPopup: ['post'] } }]);
                }
                else if (this.toloc == 'article') {
                    this.router.navigate([{ outlets: { articlePopup: ['article'] } }]);
                }
            },
            error => {
                this.loading = false;
                this.failure = true;
            }
        );
    }
    createUser(form: NgForm) {
        this.loading = true;
        this.newUser.password = this.newUser.email;
        this.appService.createUser(this.newUser).subscribe(res => {
            this.success = true;
            form.resetForm();
            this.loading = false;
            console.log(res);
        }, error => {
            this.failure = true;
            form.resetForm();
            this.loading = false;
        });
    }
    closeMsg() {
        this.success = false;
        this.failure = false;
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
    openScheduleModal() {
        this.router.navigate([{ outlets: { schedulePopup: ['schedule'] } }]);
    }
    viewPost(post: any) {
        this.closeViewPost();
        post["active"] = true;
        document.getElementsByTagName('body')[0].classList.add('overflow-hidden');
        document.getElementsByTagName('html')[0].style.overflow = 'hidden';
        setTimeout(() => {
            this.readPost = true;
            this.selectedPost = post;
        });

    }
    closeViewPost() {
        document.getElementsByTagName('body')[0].classList.remove('overflow-hidden');
        document.getElementsByTagName('html')[0].style.overflow = 'auto';
        this.selectedPost.active = false;
        this.readPost = false;
    }
    toggleTimeLine() {
        if (this.showTimeline) {
            this.showTimeline = false;
        }
        else {
            this.showTimeline = true;
        }
    }
    animateBalloons() {
        // Some random colors
const colors = ["balloon-0", "balloon-1", "balloon-2", "balloon-3"];

const numBalls = 50;
const balls = [];
let ballConatiner = document.createElement("div");
ballConatiner.setAttribute('id','balloon-container')
document.getElementsByTagName('body')[0].appendChild(ballConatiner);

for (let i = 0; i < numBalls; i++) {
  let ball = document.createElement("div");
  ball.classList.add("ball");
  ball.classList.add(colors[Math.floor(Math.random() * colors.length)]);
  ball.style.left = `${Math.floor(Math.random() * 90)}vw`;
  ball.style.top = `${Math.floor(Math.random() * 70)}vh`;
  ball.style.transform = `scale(${Math.random()})`;
  
  balls.push(ball);

  document.getElementById('balloon-container').appendChild(ball);
  //document.getElebody.append(ball);
}

// Keyframes
balls.forEach((el, i, ra) => {
  let to = {
    x: Math.random() * 12,
    y: -5
  };

  let anim = el.animate(
    [
      { transform: `translate(${to.x}rem, ${to.y}rem)` },
      { transform: "translate(0, 0)" }
      
    ],
    {
      duration: (Math.random() + 1) * 2000, // random duration
      direction: "alternate",
      fill: "forwards",
      iterations: Infinity,
      easing: "ease-in-out"
    }
  );
});

    }
}