import {AfterViewInit, Attribute, Directive, EventEmitter, Input, Output} from '@angular/core';

declare var editormd: any;
declare var $: any;

@Directive({
  selector: '[countdownTimer]'
})
export class CountdownTimerDirective implements AfterViewInit {

  @Output() onComplete: EventEmitter<any> = new EventEmitter();
  edit: any;

  ngAfterViewInit(): void {
    $('#'+this.id).countdown("07/26/2018 22:00:00",function(event) {
        var $this = $(this).html(event.strftime(''
          + '<span class="timer-num">%d</span> days: '
          + '<span class="timer-num">%H</span> hr: '
          + '<span class="timer-num">%M</span> min: '
          + '<span class="timer-num">%S</span> sec'));
      })
    this.onComplete.emit(this.edit);
  }

  constructor(@Attribute('id') private id: string) {
  }
  getHtml() {
    return this.edit.getHTML();
  }
}
