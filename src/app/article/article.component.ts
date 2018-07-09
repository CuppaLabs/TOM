import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppService } from '../app.services'

@Component({
    templateUrl: 'article.component.html',
    styleUrls: ['article.component.css']
})
export class ArticleComponent {

    article: any = {

    };
    loading: any = false;
    constructor(private router: Router, private appService: AppService) {

    }

    goToDashboard() {
        this.router.navigate([{ outlets: { articlePopup: null } }]);
    }
    createArticle() {
        this.loading = true;
        this.appService.createArticle(this.article).subscribe(res => {
            this.loading = false;
            console.log(res);
        }, error => {

        });
    }
}