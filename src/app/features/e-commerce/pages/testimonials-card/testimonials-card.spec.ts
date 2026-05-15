import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialsCard } from './testimonials-card';

describe('TestimonialsCard', () => {
  let component: TestimonialsCard;
  let fixture: ComponentFixture<TestimonialsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimonialsCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TestimonialsCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
