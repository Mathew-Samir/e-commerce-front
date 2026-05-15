import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YourOrder } from './your-order';

describe('YourOrder', () => {
  let component: YourOrder;
  let fixture: ComponentFixture<YourOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YourOrder],
    }).compileComponents();

    fixture = TestBed.createComponent(YourOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
