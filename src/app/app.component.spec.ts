import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { AppService } from './app.services'
import {RouterTestingModule} from '@angular/router/testing'
import { HttpClientModule } from '@angular/common/http';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [RouterTestingModule, HttpClientModule],
      providers: [{ provide: AppService, useClass: AppService }]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'app'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Theme of the month');
  }));
/*   it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
   // expect(compiled.querySelector('h1').textContent).toContain('Welcome to app!');
  })); */
});
