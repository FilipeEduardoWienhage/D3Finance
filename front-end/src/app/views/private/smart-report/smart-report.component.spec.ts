import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartReportComponent } from './smart-report.component';

describe('SmartReportComponent', () => {
  let component: SmartReportComponent;
  let fixture: ComponentFixture<SmartReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmartReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
