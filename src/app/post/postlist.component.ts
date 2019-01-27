import { Component, Input, Output, ViewEncapsulation, EventEmitter } from '@angular/core';

@Component({
    selector: 'post-list',
    templateUrl: './postlist.component.html',
    styleUrls: ['./postlist.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class PostListComponent {

    @Input() list: any;

    @Output()
    onItemSelect: EventEmitter<any> = new EventEmitter<any>();

    constructor() { }

    selectePost(item: any){
        this.onItemSelect.emit(item);
    }

}