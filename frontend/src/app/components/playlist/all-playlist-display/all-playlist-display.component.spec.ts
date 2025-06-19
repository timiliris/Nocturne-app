import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPlaylistDisplayComponent } from './all-playlist-display.component';

describe('AllPlaylistDisplayComponent', () => {
  let component: AllPlaylistDisplayComponent;
  let fixture: ComponentFixture<AllPlaylistDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllPlaylistDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllPlaylistDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
