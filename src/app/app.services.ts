import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';


import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';




@Injectable()
export class AppService {
    articlesUrl = 'http://localhost:5000/article/getAll';  // URL to web api
    postsUrl = 'http://localhost:5000/post/getAll';
    usersUrl = 'http://localhost:5000/user/getAll';

    createArticleUrl = 'http://localhost:5000/article/create';
    createPostUrl = 'http://localhost:5000/post/create';
    loginUrl = 'http://localhost:5000/auth/login';
    profileUrl = 'http://localhost:5000/api/profile';
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionStorage.getItem('token')
        })
    };
    constructor(
        private http: HttpClient) {
    }

    getArticles(): Observable<any[]> {
        return this.http.get<any[]>(this.articlesUrl)
            .pipe(
            tap(_ => 'done'
            ));
    }
    getPosts(): Observable<any[]> {
        return this.http.get<any[]>(this.postsUrl)
            .pipe(
            tap(_ => 'done'
            ));
    }
    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(this.usersUrl)
            .pipe(
            tap(_ => 'done'
            ));
    }
    getUserProfile(): Observable<any[]> {
        return this.http.get<any[]>(this.profileUrl, this.setHeaders())
            .pipe(
            tap(_ => 'done'
            ));
    }
    createArticle(data: any): Observable<any> {
        return this.http.post<any>(this.createArticleUrl, data, this.setHeaders())
            .pipe(
            tap(_ => 'done'
            ));
    }
    createPost(data: any): Observable<any> {
        return this.http.post<any>(this.createPostUrl, data, this.setHeaders())
            .pipe(
            tap(_ => 'done'
            ));
    }

    login(data: any): Observable<any> {
        return this.http.post<any>(this.loginUrl, data)
            .pipe(
            tap(_ => 'done'
            ));
    }
    setHeaders() {
        return this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            })
        };
    }
    //////// Save methods //////////

    /** POST: add a new hero to the database */
    /*    addHero(hero: any): Observable<any> {
            return this.http.post<any>(this.heroesUrl, hero, httpOptions)
                .pipe(
                catchError(this.handleError('addHero', hero))
                );
        }*/

    /** DELETE: delete the hero from the server */
    /*    deleteHero(id: number): Observable<{}> {
            const url = `${this.heroesUrl}/${id}`; // DELETE api/heroes/42
            return this.http.delete(url, httpOptions)
                .pipe(
                catchError(this.handleError('deleteHero'))
                );
        }*/

    /** PUT: update the hero on the server. Returns the updated hero upon success. */
    /*    updateHero(hero: Hero): Observable<Hero> {
            httpOptions.headers =
                httpOptions.headers.set('Authorization', 'my-new-auth-token');
    
            return this.http.put<Hero>(this.heroesUrl, hero, httpOptions)
                .pipe(
                catchError(this.handleError('updateHero', hero))
                );
        }*/
}
