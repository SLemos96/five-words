import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsScreenComponent } from './details-screen.component';

describe('DetailsScreenComponent', () => {
  let component: DetailsScreenComponent;
  let fixture: ComponentFixture<DetailsScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
