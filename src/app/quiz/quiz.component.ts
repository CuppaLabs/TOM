import { Component, OnInit, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { AppService } from '../app.services';
import {Observable, Subscription} from 'rxjs/Rx';
import {EventSourcePolyfill} from 'ng-event-source';

declare var $: any;

@Component({
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.css']
})
export class QuizComponent {

    newUser: any = {
        name: "",
        email: ""
    };
    answer:any = {
        questionId: "",
        answer: ""
    }
    currentQuestion: any;
    userList: any;
    result:any = [];
    questionList: any;
    receiveActiveObs: any;
    receiveActiveQuestion: any;
    receiveResultObs:any;
    private sse : any;
   // protected _eventSource: EventSource;
    private sseStream: Subscription;
    messages:Array<string> = [];
    success: boolean = false;
    failure: boolean = false;
    errorMsg: any = "Oops !! Something went wrong.";
    total: any;
    rtotal: any;
    wtotal: any;
constructor(private appService: AppService, private changeDetector: ChangeDetectorRef, private zone:NgZone){

}

ngOnInit(){
     //this.sseStream = this.appService.observe('http://10.177.153.50:5000/stream')
     this.sseStream = this.appService.observe('http://localhost:5000/stream')
    .subscribe(message => {
        var data = JSON.parse(message);
        this.result.push(JSON.parse(message));
        if(data.flag){
            this.rtotal++;
        }
        else {
            this.wtotal++
        }
        this.total = this.rtotal + this.wtotal;
    }); 
    if(sessionStorage.getItem("token") == "" || sessionStorage.getItem("token") == undefined){
        $('#exampleModal').modal('show');
    }
    if(sessionStorage.getItem("token")){
        this.getUserProfile();
    }
}

connectToChat(): void {
    let connected = this.appService.isConnected();
    if (connected == true) {
      this.getUserList();
      this.getCurrentQuestion();
     // this.getResult();
    } else {
      this.appService.connect(this.newUser.email, () => {
        this.getUserList();
        this.getCurrentQuestion();
      //  this.getResult();
      });
    }
  }
  getUserProfile() {
    this.appService.getUserProfile().subscribe(
        res => {
            this.newUser = Object.assign(this.newUser, res);
            if(this.newUser.email == "suchit.kumar@oracle.com" || this.newUser.email == "pradeep.terli@oracle.com"){
                this.getAllQuestions();
            }
            this.connectToChat();
        },
        error => {

        }
    );
}
getResult(){
    
    this.appService.receiveResult({"questionId":this.currentQuestion._id})
    .subscribe(res => {
        this.result = res.data;
        this.total = res.total;
        this.rtotal = res.rtotal;
        this.wtotal = res.wtotal;
        console.log(res.data);
    });
}
getUserList(): void {
    this.receiveActiveObs = this.appService.receiveActiveList()
    .subscribe(users => {
        this.userList = users;
        console.log(users);
    });
  }
  getCurrentQuestion(): void {
    this.success = false;
    this.failure = false;
    this.receiveActiveQuestion = this.appService.receiveCurrentQuestion()
    .subscribe(data => {
        console.log(data);
        this.currentQuestion = data;
        if(data._id){
            this.answer.questionId = data._id;
            this.answer.answer = "";
            if(this.questionList){
                this.questionList.forEach(item => {
                
                    if(item._id == data._id){
                        item.active = true
                    }
                    else {
                        item.active = false
                    }
                });

            }

            this.getResult();
        }
       
    });
  }
  
  getAllQuestions() {
    this.appService.getQuestions()
    .subscribe(questions => {
        this.questionList = questions;
    });
  }
  publishQues(ques:any){
    console.log(ques);
    this.success = false;
    this.failure = false;
    this.answer.answer = "";
    this.questionList.forEach(item => {
        item.active = false;
    });
    ques.active = true;
    this.appService.sendQuestion(ques);
  }
  submitAnswer(){
       this.appService.answerQuestion(this.answer).subscribe(res => {
        console.log(res);
        this.success = true;
        this.appService.sendResult(res);
      }, err => {
          this.errorMsg = err.error.error;
          this.failure = true;
        console.log(err);
      });
      console.log(this.answer);
  }
  closeMsg(){
      this.success = false;
      this.failure = false;
  }
}