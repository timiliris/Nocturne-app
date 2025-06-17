import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakerAnimComponent } from './speaker-anim.component';

describe('SpeakerAnimComponent', () => {
  let component: SpeakerAnimComponent;
  let fixture: ComponentFixture<SpeakerAnimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeakerAnimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeakerAnimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
