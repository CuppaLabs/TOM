import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppService } from '../app.services'

@Component({
    templateUrl: 'faq.component.html',
    styleUrls: ['faq.component.css']
})
export class FaqComponent {


    constructor(private router: Router, private appService: AppService) {

    }

}