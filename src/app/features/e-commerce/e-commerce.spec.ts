import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ECommerce } from './e-commerce';

describe('ECommerce', () => {
  let component: ECommerce;
  let fixture: ComponentFixture<ECommerce>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ECommerce],
    }).compileComponents();

    fixture = TestBed.createComponent(ECommerce);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
