import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistInMenuComponent } from './playlist-in-menu.component';

describe('PlaylistInMenuComponent', () => {
  let component: PlaylistInMenuComponent;
  let fixture: ComponentFixture<PlaylistInMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistInMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistInMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
