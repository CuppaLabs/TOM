import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
    templateUrl: 'article.component.html',
    styleUrls: ['article.component.css']
})
export class ArticleComponent {


    constructor(private router: Router) {

    }
    goToDashboard() {
        this.router.navigate([{ outlets: { articlePopup: null } }]);
    }
}