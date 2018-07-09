import { Component , ViewChild} from '@angular/core';
import { Router } from '@angular/router';

import { EditorConfig } from '../editormd/director/model/editor-config';
import { AppService } from '../app.services'
import { EditorMdDirective } from '../editormd/director/editor-md.directive'
@Component({
    templateUrl: 'post.component.html',
    styleUrls: ['post.component.css']
})
export class PostComponent {
    conf = new EditorConfig();
    editorInstance: any;
    @ViewChild(EditorMdDirective) vc:EditorMdDirective; 
    
    post: any = {
        title: "",
        category:"",
        content:"",
        description:""
    }
    loading: boolean = false;
    constructor(private router: Router, private appService: AppService) {

    }
    onComplate(editorInstance: any) {
        this.editorInstance = editorInstance;

    }
    goToDashboard() {
        this.router.navigate([{ outlets: { postPopup: null }}]);
    }
    createPost() {
        this.loading = true;
        this.post.content = this.vc.getHtml();
        this.appService.createPost(this.post).subscribe(res => {
            console.log(res);
            this.loading = false;
        }, error => {

        });
    }
}