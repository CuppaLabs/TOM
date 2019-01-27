import { Component,Input } from '@angular/core';

@Component({
    selector: 'user-list',
    templateUrl: './userlist.component.html',
    styleUrls: ['./userlist.component.css']
})
export class UserList {
    @Input()
    users: any;
}