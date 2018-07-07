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
    constructor(private router: Router, private appService: AppService) {

    }

    goToDashboard() {
        this.router.navigate([{ outlets: { articlePopup: null } }]);
    }
    createArticle() {
        this.appService.createArticle(this.article).subscribe(res => {
            console.log(res);
        }, error => {

        });
    }
}