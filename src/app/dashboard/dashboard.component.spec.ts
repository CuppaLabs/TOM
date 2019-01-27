import { TestBed, async } from '@angular/core/testing';
  import { AppService } from '../app.services';
import { Dashboard } from './dashboard.component';
import {} from 'jasmine';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

describe('DashboardComponent (class only)', () => {
    let comp: Dashboard;
    let appService: AppService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      // provide the component-under-test and dependent service
      providers: [
        Dashboard,
        { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
        { provide: AppService, useClass: AppService }
      ]
    });
    // inject both the component and the dependent service.
    comp = TestBed.get(Dashboard);
    appService = TestBed.get(AppService);

  });
  it('isLoggedIn to be false', () => {
    expect(comp.isLoggedIn).toEqual(false);
  });
});