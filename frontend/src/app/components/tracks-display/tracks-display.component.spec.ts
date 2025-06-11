import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TracksDisplayComponent } from './tracks-display.component';

describe('TracksDisplayComponent', () => {
  let component: TracksDisplayComponent;
  let fixture: ComponentFixture<TracksDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TracksDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TracksDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
