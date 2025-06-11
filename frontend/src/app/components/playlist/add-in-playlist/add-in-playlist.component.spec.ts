import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInPlaylistComponent } from './add-in-playlist.component';

describe('AddInPlaylistComponent', () => {
  let component: AddInPlaylistComponent;
  let fixture: ComponentFixture<AddInPlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInPlaylistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
