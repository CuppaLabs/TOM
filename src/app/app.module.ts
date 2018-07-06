import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRouterModule } from './app.router';
import { AppComponent } from './app.component';
import { Dashboard } from './dashboard/dashboard.component';
import { PostComponent } from './post/post.component';
import { ArticleComponent } from './article/article.component';

import {EditorMdModule} from './editormd/editor-md.module';

@NgModule({
  declarations: [
    AppComponent,
    Dashboard,
    PostComponent,
    ArticleComponent
  ],
  imports: [
    BrowserModule,
    EditorMdModule,
    AppRouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
