import { NgModule } from '@angular/core';
import { RouterModule, Router, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard.component';
import { PostComponent } from './post/post.component';
import { ArticleComponent } from './article/article.component';
import { ScheduleComponent } from './information/schedule.component';
import { FaqComponent } from './information/faq.component';
import { ChallengeComponent } from './challenge/challenge.component';
import { RegisterComponent } from './register/register.component';
import { QuizComponent } from './quiz/quiz.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { UserProfile } from './userProfile/userprofile.component';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
        path: 'dashboard', component: Dashboard
    },
    {
        path: 'user/:id', component: UserProfile
    },
    {
        path:'quiz', component: QuizComponent
    },
    { path: 'faq', component: FaqComponent },
    { path: 'schedule', component: ScheduleComponent, outlet: 'schedulePopup' },
    { path: 'post', component: PostComponent, outlet: 'postPopup' },
    { path: 'article', component: ArticleComponent, outlet: 'articlePopup' },
    { path: 'challenge', component: ChallengeComponent, outlet: 'challengePopup' },
    { path: 'session', component: RegisterComponent, outlet: 'sessionPopup' },
    { path: 'quiz', component: QuizComponent, outlet: 'quizPopup' },
    { path: 'statistics', component: StatisticsComponent, outlet: 'statisticsPopup' }
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRouterModule {
}