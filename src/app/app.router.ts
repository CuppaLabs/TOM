import { NgModule } from '@angular/core';
import { RouterModule, Router, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard.component';
import { PostComponent } from './post/post.component';
import { ArticleComponent } from './article/article.component';

const routes: Routes = [
    {path:'',component: Dashboard },
    {path:'dashboard',component: Dashboard },
    {path:'post',component: PostComponent, outlet: 'postPopup' },
    {path:'article',component: ArticleComponent, outlet: 'articlePopup' },
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRouterModule {
}