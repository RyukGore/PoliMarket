import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVendedor } from './add-vendedor';

describe('AddVendedor', () => {
  let component: AddVendedor;
  let fixture: ComponentFixture<AddVendedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddVendedor],
    }).compileComponents();

    fixture = TestBed.createComponent(AddVendedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
