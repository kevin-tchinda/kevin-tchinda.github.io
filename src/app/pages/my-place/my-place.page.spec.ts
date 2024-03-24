import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyPlacePage } from './my-place.page';

describe('MyPlacePage', () => {
  let component: MyPlacePage;
  let fixture: ComponentFixture<MyPlacePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MyPlacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
