import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { EditorConfig } from '../editormd/director/model/editor-config';

@Component({
    templateUrl: 'post.component.html',
    styleUrls: ['post.component.css']
})
export class PostComponent {
    conf = new EditorConfig();
    editorInstance: any;
    constructor(private router: Router) {

    }
    onComplate(editorInstance: any) {
        this.editorInstance = editorInstance;

    }
    goToDashboard() {
        this.router.navigate([{ outlets: { postPopup: null }}]);
    }
}