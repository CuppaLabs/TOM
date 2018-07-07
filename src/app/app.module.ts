import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRouterModule } from './app.router';
import { AppComponent } from './app.component';
import { Dashboard } from './dashboard/dashboard.component';
import { PostComponent } from './post/post.component';
import { ArticleComponent } from './article/article.component';

import {EditorMdModule} from './editormd/editor-md.module';
import { AppService } from './app.services'
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
    AppRouterModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
