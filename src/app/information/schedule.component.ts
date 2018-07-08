import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppService } from '../app.services'

@Component({
    templateUrl: 'schedule.component.html',
    styleUrls: ['schedule.component.css']
})
export class ScheduleComponent implements OnInit {


    constructor(private router: Router, private appService: AppService) {

    }
    ngOnInit(){
        document.getElementById('main-wrapper').classList.add('blur');
    }
    goToDashboard() {
        document.getElementById('main-wrapper').classList.remove('blur');
        this.router.navigate([{ outlets: { schedulePopup: null } }]);
    }
}