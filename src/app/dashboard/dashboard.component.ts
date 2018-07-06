
import { Component, AfterViewInit } from '@angular/core';
import { EditorConfig } from '../editormd/director/model/editor-config';
import { Router} from '@angular/router';

declare var $: any;
declare var $: any;

@Component({
    selector: 'dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.css']
})
export class Dashboard {

    conf = new EditorConfig();
    editorInstance: any;

    constructor(private router: Router) {
        
    }
    openPostModal() {
      this.router.navigate([{ outlets: { postPopup: [ 'post' ] }}]); 
    }
    onComplate(editorInstance: any) {
        this.editorInstance = editorInstance;
       
    }

}