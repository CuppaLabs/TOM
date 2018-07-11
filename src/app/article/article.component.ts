import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppService } from '../app.services'
import { NgForm } from '@angular/forms';

@Component({
    templateUrl: 'article.component.html',
    styleUrls: ['article.component.css']
})
export class ArticleComponent {

    article: any = {
        title: "",
        category: "",
        description: "",
        link: ""
    };
    loading: any = false;
    success: Boolean = false;
    failure: Boolean = false;
    constructor(private router: Router, private appService: AppService) {

    }

    goToDashboard() {
        this.router.navigate([{ outlets: { articlePopup: null } }]);
        //this.router.navigate(['/dashboard']);

    }
    createArticle(form: NgForm) {
        this.loading = true;
        this.appService.createArticle(this.article).subscribe(res => {
            this.loading = false;
            this.success = true;
            form.resetForm();
            this.article.category = "";
            setTimeout(() => {
                this.goToDashboard();
            },2000);
        }, error => {
            this.failure = true;
            form.resetForm();
            this.article.category = "";
        });
    }
    closeMsg(){
        this.success = false;
        this.failure = false;
    }
}