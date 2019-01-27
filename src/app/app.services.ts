import { Injectable, EventEmitter, NgZone  } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';


import { Observable, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import * as io from 'socket.io-client';

const EventSource: any = window['EventSource'];


@Injectable()
export class AppService {
    private missionAnnouncedSource = new Subject<string>();
    missionAnnounced$ = this.missionAnnouncedSource.asObservable();
    //domain = 'http://10.177.153.50:5000/';
    //socketDomain = 'http://10.177.153.50:5300';
    domain = 'http://localhost:5000/';
    socketDomain = 'http://localhost:5300';

    articlesUrl = this.domain + 'article/getAll';  // URL to web api
    postsUrl = this.domain + 'post/getAll';
    usersUrl = this.domain + 'user/getAll';

    createArticleUrl = this.domain + 'article/create';
    createPostUrl = this.domain + 'post/create';
    loginUrl = this.domain + 'auth/login';
    profileUrl = this.domain + 'api/profile';
    createUserUrl = this.domain + 'auth/signup';
    createChallengeUrl = this.domain + 'challenge/create';
    giveFeedbackrUrl = this.domain + 'feedback/create';
    challengesUrl = this.domain + 'challenge/getAll';
    registerUrl = this.domain + 'api/register';
    questionsUrl = this.domain + 'question/getAll';
    quesAnswerUrl = this.domain + 'question/answer';
    questionResult = this.domain + 'question/result';
    statisticsUrl = this.domain + 'statistics';

    private socket: any;
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionStorage.getItem('token')
        })
    };
    constructor(
        private http: HttpClient, private zone: NgZone) {
    }
    connect(username: string, callback: Function = () => { }): void {
        // initialize the connection
        this.socket = io(this.socketDomain, { path: '/chat' });

        this.socket.on('error', (error) => {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
        });

        this.socket.on("connect", () => {
            this.sendUser(username);
            console.log("connected to the chat server");
            callback();
        });
    }
    isConnected(): boolean {
        if (this.socket != null) {
            return true;
        } else {
            return false;
        }
    }
    sendUser(username: string): void {
        this.socket.emit("username", { username: username });
    }
    sendQuestion(data: any): void {
        this.socket.emit("question", data);
    }
    sendResult(data: any): void {
        this.socket.emit("submit", data);
    }
    receiveCurrentQuestion(): any {
        let observable = new Observable(observer => {
            this.socket.on("currentQuestion", (data) => {
                observer.next(data);
            });
        });

        return observable;
    }
    receiveActiveList(): any {
        let observable = new Observable(observer => {
            this.socket.on("active", (data) => {
                observer.next(data);
            });
        });

        return observable;
    }
    receiveResult(data:any): any {
        return this.http.post<any>(this.questionResult, data, this.setHeaders())
        .pipe(
            tap(_ => 'done'
            ));
    }
    getQuestions(): Observable<any[]> {
        return this.http.get<any[]>(this.questionsUrl)
            .pipe(
                tap(_ => 'done'
                ));
    }
    answerQuestion(data: any): Observable<any> {
        return this.http.post<any>(this.quesAnswerUrl, data, this.setHeaders())
            .pipe(
                tap(_ => 'done'
                ));
    }
    observe(sseUrl: string): Observable<any> {
        return new Observable<string>(obs => {
            const es = new EventSource(sseUrl);
            es.addEventListener('message', (evt) => {
                console.log(evt.data);
                obs.next(evt.data);
            });
            return () => es.close();
        });
      }
    getStatistics(): Observable<any[]> {
        return this.http.get<any[]>(this.statisticsUrl)
            .pipe(
                tap(_ => 'done'
                ));
    }
    getArticles(): Observable<any[]> {
        return this.http.get<any[]>(this.articlesUrl)
            .pipe(
                tap(_ => 'done'
                ));
    }
    getChallenges(): Observable<any[]> {
        return this.http.get<any[]>(this.challengesUrl)
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
    createChallenge(data: any): Observable<any> {
        return this.http.post<any>(this.createChallengeUrl, data, this.setHeaders())
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
    createUser(data: any): Observable<any> {
        return this.http.post<any>(this.createUserUrl, data, this.setHeaders())
            .pipe(
                tap(_ => 'done'
                ));
    }
    giveFeedback(data: any): Observable<any> {
        return this.http.post<any>(this.giveFeedbackrUrl, data, this.setHeaders())
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
    register(data: any): Observable<any> {
        return this.http.post<any>(this.registerUrl, data, this.setHeaders())
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
    announceMission(mission: string) {
        this.missionAnnouncedSource.next(mission);
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
