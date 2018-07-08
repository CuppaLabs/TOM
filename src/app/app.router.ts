import { NgModule } from '@angular/core';
import { RouterModule, Router, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard.component';
import { PostComponent } from './post/post.component';
import { ArticleComponent } from './article/article.component';
import { ScheduleComponent } from './information/schedule.component';
import { FaqComponent } from './information/faq.component';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
        path: 'dashboard', component: Dashboard
    },
    { path: 'faq', component: FaqComponent },
    { path: 'schedule', component: ScheduleComponent, outlet: 'schedulePopup' },
    { path: 'post', component: PostComponent, outlet: 'postPopup' },
    { path: 'article', component: ArticleComponent, outlet: 'articlePopup' },
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRouterModule {
}