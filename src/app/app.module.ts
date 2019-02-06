import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRouterModule } from './app.router';
import { AppComponent } from './app.component';
import { Dashboard } from './dashboard/dashboard.component';
import { PostComponent } from './post/post.component';
import { ArticleComponent } from './article/article.component';
import { ScheduleComponent } from './information/schedule.component';
import { FaqComponent } from './information/faq.component';
import { EscapeHtmlPipe } from './sanitizer.pipe';
import { CountdownTimerDirective } from './timer/timer.directive';
import {EditorMdModule} from './editormd/editor-md.module';
import { ChallengeComponent } from './challenge/challenge.component';
import { FileUploadModule, FileDropDirective } from 'ng2-file-upload';
import { AppService } from './app.services';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { RegisterComponent } from './register/register.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { PostListComponent } from './post/postlist.component';
import { QuizComponent } from './quiz/quiz.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { UserProfile } from './userProfile/userprofile.component';
import { EqualValidator } from './validator.directive';
@NgModule({
  declarations: [
    AppComponent,
    Dashboard,
    PostComponent,
    ArticleComponent,
    ScheduleComponent,
    FaqComponent,
    EscapeHtmlPipe,
    CountdownTimerDirective,
    ChallengeComponent,
    RegisterComponent,
    PostListComponent,
    QuizComponent,
    StatisticsComponent,
    UserProfile,
    EqualValidator
  ],
  imports: [
    BrowserModule,
    EditorMdModule,
    AppRouterModule,
    HttpClientModule,
    NgxQRCodeModule,
    FormsModule,
    FileUploadModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
