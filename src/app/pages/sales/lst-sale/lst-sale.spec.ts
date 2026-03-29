import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LstSale } from './lst-sale';

describe('LstSale', () => {
  let component: LstSale;
  let fixture: ComponentFixture<LstSale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LstSale],
    }).compileComponents();

    fixture = TestBed.createComponent(LstSale);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
