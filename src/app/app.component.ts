import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from './app.services'
import { DomSanitizer } from '@angular/platform-browser';
import { EditorConfig } from './editormd/director/model/editor-config';
declare var $: any;
declare var $: any;
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Theme of the month';
  conf = new EditorConfig();
  editorInstance: any;
  user: any = { email: "", password: "" };
  isLoggedIn = false;
  posts: any = [];
  articles: any = [];
  users: any = [];
  challenges: any = [];
  loggedUser: any = {};
  toloc: any = '';
  selectedPost: any = {};
  readPost: boolean = false;
  newUser: any = {
    email: "",
    name: "",
    password: "",
    confirmPassword: ""
  };
  feedback: any = {
    name: '',
    email: '',
    feedback: ''
  }
  success: Boolean = false;
  failure: Boolean = false;
  showTimeline: Boolean = true;
  loading: Boolean = false;
  openFeedbackDialog: Boolean = false;
  timeLine: any = [
    {
      id: 1,
      title: 'Launch',
      date: '7th Feb, 2019',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Documents',
      date: '7th, 8th, 11th Feb, 2019 ',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Training',
      date: '12th - 15th Feb, 2019 ',
      status: 'pending'
    },
    {
      id: 4,
      title: 'Use case workshops',
      date: '18th - 22nd feb, 2019 ',
      status: 'pending'
    },
    {
      id: 5,
      title: 'Demo presentations',
      date: '25th - 27th Feb, 2019 ',
      status: 'pending'
    },
    {
      id: 6,
      title: 'Closure',
      date: '28th Feb, 2019 ',
      status: 'pending'
    }
  ];
  constructor(private router: Router, private appService: AppService, private sanitizer: DomSanitizer) {

  }
  ngOnInit() {
    this.getUserProfile();
    if (sessionStorage.getItem("token")) {
      this.isLoggedIn = true;
    }
  }
  onDeactivate(evt: any) {
    this.appService.announceMission("posts");
  }
  onArticleDeactivate() {
    this.appService.announceMission("articles");
  }
  register() {
    if (this.isLoggedIn) {
      this.router.navigate([{ outlets: { sessionPopup: ['session'] } }]);
    }
    else {
      this.toloc = 'register';
      $('#exampleModal').modal('show')
    }
  }
  login() {
    this.loading = true;
    //this.user.password = this.user.email;
    this.appService.login(this.user).subscribe(
      res => {
        this.loading = false;
        console.log(res);
        $('#exampleModal').modal('hide')
        sessionStorage.setItem("token", res.token);
        this.isLoggedIn = true;
        this.appService.userLoginStatus.next(res.user);
        this.getUserProfile();
        if (this.toloc == 'post') {
          this.router.navigate([{ outlets: { postPopup: ['post'] } }]);
        }
        else if (this.toloc == 'article') {
          this.router.navigate([{ outlets: { articlePopup: ['article'] } }]);
        }
        else if (this.openFeedbackDialog) {
          $('#feedbackModal').modal('show')
        }
        else if (this.toloc == 'register' || this.router.url == "/dashboard(sessionPopup:session)") {
          this.router.navigate([{ outlets: { sessionPopup: ['session'] } }]);
          location.reload();
        }
        else if (this.toloc == 'takequiz' || this.router.url == "/dashboard(quizPopup:quiz)") {
          this.router.navigate([{ outlets: { quizPopup: ['quiz'] } }]);
          location.reload();
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
    // this.newUser.password = this.newUser.email;
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
    this.router.navigate(['/dashboard']);
  }
  getUserProfile() {
    this.appService.getUserProfile().subscribe(
      res => {
        this.loggedUser = res;
        //location.reload();
      },
      error => {

      }
    );
  }
  openFeedbackModel() {
    if (this.isLoggedIn) {
      $('#feedbackModal').modal('show')
    }
    else {
      this.toloc = '';
      this.openFeedbackDialog = true;
      $('#exampleModal').modal('show')
    }
  }

  giveFeedback() {
    this.loading = true;
    this.feedback.name = this.loggedUser.name;
    this.feedback.email = this.loggedUser.email;
    this.appService.giveFeedback(this.feedback).subscribe(res => {
      this.success = true;
      this.loading = false;
    }, error => {
      this.failure = true;
      this.loading = false;
    });
  }
  toggleTimeLine() {
    if (this.showTimeline) {
      this.showTimeline = false;
    }
    else {
      this.showTimeline = true;
    }
  }
}
