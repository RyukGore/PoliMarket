import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { startWith } from 'rxjs';

type SaleDetailForm = {
  productId: FormControl<string>;
  productName: FormControl<string>;
  quantity: FormControl<number>;
  unitPrice: FormControl<number>;
  total: FormControl<number>;
};

type SaleSummary = {
  customerName: string;
  documentType: string;
  documentNumber: string;
  address: string;
  details: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  grandTotal: number;
};

@Component({
  selector: 'app-sale',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './sale.html',
  styleUrl: './sale.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sale {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly documentTypes = ['CC', 'CE', 'NIT', 'PASAPORTE'];

  readonly saleForm = this.fb.group({
    customerName: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    documentType: this.fb.control('CC', [Validators.required]),
    documentNumber: this.fb.control('', [Validators.required, Validators.minLength(5)]),
    address: this.fb.control('', [Validators.required, Validators.minLength(5)]),
    details: this.fb.array([this.createDetailLine()]),
  });

  readonly savedSale = signal<SaleSummary | null>(null);

  readonly saleFormValue = toSignal(
    this.saleForm.valueChanges.pipe(startWith(this.saleForm.getRawValue())),
    { initialValue: this.saleForm.getRawValue() },
  );

  readonly grandTotal = computed(() => {
    const details = this.saleFormValue().details ?? [];
    return details.reduce((accumulator, line) => accumulator + (Number(line.total) || 0), 0);
  });

  /**
   * Obtiene el FormArray de detalles de venta.
   * @returns FormArray de detalles de venta
   */
  get saleDetails(): FormArray<ReturnType<Sale['createDetailLine']>> {
    return this.saleForm.controls.details;
  }

  /**
   * Agrega una nueva línea de detalle de venta.
   */
  addDetailLine(): void {
    this.saleDetails.push(this.createDetailLine());
  }

  /**
   * Elimina una línea de detalle de venta.
   * @param index Índice de la línea a eliminar
   */
  removeDetailLine(index: number): void {
    if (this.saleDetails.length === 1) {
      return;
    }

    this.saleDetails.removeAt(index);
  }

  /**
   * Actualiza el total de una línea de detalle de venta.
   * @param index Índice de la línea a actualizar
   */
  updateLineTotal(index: number): void {
    const line = this.saleDetails.at(index);
    if (!line) {
      return;
    }

    const quantity = Number(line.controls.quantity.value) || 0;
    const unitPrice = Number(line.controls.unitPrice.value) || 0;
    const total = this.roundCurrency(quantity * unitPrice);

    line.controls.total.setValue(total);
  }

  /**
   * Guarda la venta actual.
   */
  saveSale(): void {
    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      return;
    }

    this.saleDetails.controls.forEach((_, index) => this.updateLineTotal(index));

    const saleValue = this.saleForm.getRawValue();
    this.savedSale.set({
      customerName: saleValue.customerName,
      documentType: saleValue.documentType,
      documentNumber: saleValue.documentNumber,
      address: saleValue.address,
      details: saleValue.details,
      grandTotal: this.grandTotal(),
    });

    console.log('Venta guardada:', this.savedSale());
  }

  /**
   * Crea una nueva línea de detalle de venta.
   * @returns FormGroup<SaleDetailForm>
   */
  private createDetailLine() {
    return this.fb.group<SaleDetailForm>({
      productId: this.fb.control('', [Validators.required]),
      productName: this.fb.control('', [Validators.required]),
      quantity: this.fb.control(1, [Validators.required, Validators.min(1)]),
      unitPrice: this.fb.control(0, [Validators.required, Validators.min(0)]),
      total: this.fb.control(0, [Validators.required, Validators.min(0)]),
    });
  }

  /**
   * Redondea un valor a dos decimales.
   * @param value Valor a redondear
   * @returns Valor redondeado
   */

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
