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
import { SaleRequest } from '../../../models/sale-request.model';
import { ProductStock } from '../../../models/product-stock.model';
import { SalesService } from '../../../services/sales.service';
import { LstSale } from '../lst-sale/lst-sale';

/**
 * Componente para la creación de ventas. Permite seleccionar productos, ingresar detalles del cliente y guardar la venta.
 * También incluye un modal para mostrar el historial de ventas realizadas.
 */
type SaleDetailForm = {
  productId: FormControl<string>;
  productName: FormControl<string>;
  availableStock: FormControl<number>;
  quantity: FormControl<number>;
  unitPrice: FormControl<number>;
  total: FormControl<number>;
};

/**
 * Tipo que representa el resumen de una venta realizada, utilizado para mostrar los detalles de la venta después de guardarla exitosamente. Incluye el tipo y número de documento del cliente, los detalles de los productos vendidos y el total general de la venta.
 */
type SaleSummary = {
  documentType: string;
  documentNumber: string;
  details: Array<{
    productId: string;
    productName: string;
    availableStock: number;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  grandTotal: number;
};

@Component({
  selector: 'app-sale',
  imports: [ReactiveFormsModule, DecimalPipe, LstSale],
  templateUrl: './sale.html',
  styleUrl: './sale.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sale {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly salesService = inject(SalesService);

  readonly documentTypes = ['CC', 'CE', 'NIT', 'PASAPORTE'];
  readonly availableProducts = signal<ProductStock[]>([]);
  readonly loadingProducts = signal(false);
  readonly loadError = signal('');
  readonly submitError = signal('');
  readonly savingSale = signal(false);
  readonly showSalesModal = signal(false);

  readonly saleForm = this.fb.group({
    documentType: this.fb.control('CC', [Validators.required]),
    documentNumber: this.fb.control('', [Validators.required, Validators.minLength(5)]),
    details: this.fb.array<ReturnType<Sale['createDetailLine']>>([]),
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

  constructor() {
    this.loadProducts();
  }

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
  addProductToSale(product: ProductStock): void {
    this.submitError.set('');
    const availableStock = this.getAvailableStock(product);

    if (availableStock <= 0) {
      this.submitError.set(`El producto ${product.nombre} no tiene stock disponible.`);
      return;
    }

    const existingIndex = this.saleDetails.controls.findIndex(
      (line) => line.controls.productId.value === product.idProducto,
    );

    if (existingIndex >= 0) {
      const existingLine = this.saleDetails.at(existingIndex);
      const currentQty = Number(existingLine.controls.quantity.value) || 0;

      if (currentQty >= availableStock) {
        this.submitError.set(`No hay más stock disponible para ${product.nombre}.`);
        return;
      }

      existingLine.controls.quantity.setValue(currentQty + 1);
      this.updateLineTotal(existingIndex);
      return;
    }

    this.saleDetails.push(
      this.createDetailLine({
        productId: product.idProducto,
        productName: product.nombre,
        availableStock,
        quantity: 1,
        unitPrice: product.precio,
      }),
    );

    this.updateLineTotal(this.saleDetails.length - 1);
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

    const availableStock = Number(line.controls.availableStock.value) || 0;
    const quantity = Number(line.controls.quantity.value) || 0;
    const normalizedQty = Math.max(1, Math.min(quantity, availableStock || 1));
    if (normalizedQty !== quantity) {
      line.controls.quantity.setValue(normalizedQty);
    }

    const unitPrice = Number(line.controls.unitPrice.value) || 0;
    const total = this.roundCurrency(normalizedQty * unitPrice);

    line.controls.total.setValue(total);
  }

  /**
   * Guarda la venta actual.
   */
  saveSale(): void {
    this.submitError.set('');

    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      return;
    }

    if (this.saleDetails.length === 0) {
      this.submitError.set('Debes agregar al menos un producto para crear la venta.');
      return;
    }

    this.saleDetails.controls.forEach((_, index) => this.updateLineTotal(index));

    const idVendedor = localStorage.getItem('polimarket_idVendedor')?.trim() ?? '';
    if (!idVendedor) {
      this.submitError.set(
        'No se encontró el ID del vendedor. Regresa al inicio e ingresa nuevamente.',
      );
      return;
    }

    const saleValue = this.saleForm.getRawValue();

    console.log('Preparando solicitud de venta con los siguientes datos:', saleValue);

    const productosSeleccionados = saleValue.details
      .map((line) => ({
        idProducto: String(line.productId).trim(),
        cantidad: Number(line.quantity) || 0,
        nombreProducto: String(line.productName),
      }))
      .filter((line) => line.idProducto.length > 0 && line.cantidad > 0);

    if (productosSeleccionados.length === 0) {
      this.submitError.set('Debes seleccionar al menos un producto con cantidad válida.');
      return;
    }

    const request: SaleRequest = {
      idVendedor,
      documentoCliente: String(saleValue.documentNumber).trim(),
      productos: productosSeleccionados,
    };

    this.savingSale.set(true);
    this.salesService.insertSale(request).subscribe({
      next: () => {
        this.savedSale.set({
          documentType: saleValue.documentType,
          documentNumber: saleValue.documentNumber,
          details: saleValue.details,
          grandTotal: this.grandTotal(),
        });

        this.resetFormForNextSale();
        this.loadProducts();
      },
      error: () => {
        this.submitError.set('No fue posible guardar la venta. Intenta nuevamente.');
      },
      complete: () => {
        this.savingSale.set(false);
      },
    });
  }

  /**
   * Calcula el stock disponible de un producto sumando las cantidades de todos los almacenes.
   * @param product Producto del cual se desea obtener el stock disponible.
   * @returns Cantidad total disponible del producto.
   */
  getAvailableStock(product: ProductStock): number {
    return product.stoks.reduce((sum, stock) => sum + (Number(stock.cantidad) || 0), 0);
  }

  /**
   * Abre el modal para mostrar el historial de ventas realizadas.
   */
  openSalesModal(): void {
    this.showSalesModal.set(true);
  }

  /**
   * Inicia el proceso para crear una nueva venta, cerrando el modal de historial de ventas si está abierto.
   * Esto permite al usuario volver rápidamente a la creación de ventas después de revisar el historial.
   */
  startNewSale(): void {
    this.closeSalesModal();
  }

  /**
   * Refresca el listado de productos disponibles para la venta, útil después de realizar una venta para ver los cambios en stock.
   */
  refreshStock(): void {
    this.loadProducts();
  }

  /**
   * Cierra el modal de historial de ventas.
   */
  closeSalesModal(): void {
    this.showSalesModal.set(false);
  }

  /**
   * Cierra el modal de historial de ventas al hacer clic en el fondo del modal.
   * @param event Evento de clic
   */
  closeSalesModalOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('sales-modal-overlay')) {
      this.closeSalesModal();
    }
  }

  /**
   * Crea una nueva línea de detalle de venta.
   * @returns FormGroup<SaleDetailForm>
   */
  private createDetailLine(initial?: {
    productId: string;
    productName: string;
    availableStock: number;
    quantity: number;
    unitPrice: number;
  }) {
    return this.fb.group<SaleDetailForm>({
      productId: this.fb.control(initial?.productId ?? '', [Validators.required]),
      productName: this.fb.control(initial?.productName ?? '', [Validators.required]),
      availableStock: this.fb.control(initial?.availableStock ?? 0, [Validators.required]),
      quantity: this.fb.control(initial?.quantity ?? 1, [Validators.required, Validators.min(1)]),
      unitPrice: this.fb.control(initial?.unitPrice ?? 0, [Validators.required, Validators.min(0)]),
      total: this.fb.control(0, [Validators.required, Validators.min(0)]),
    });
  }

  /**
   * Carga el listado de productos disponibles para la venta desde el servicio.
   * Maneja el estado de carga y posibles errores.
   */
  private loadProducts(): void {
    this.loadingProducts.set(true);
    this.loadError.set('');

    this.salesService.productsStock().subscribe({
      next: (products) => {
        this.availableProducts.set(products);
      },
      error: () => {
        this.loadError.set('No fue posible cargar los productos disponibles.');
      },
      complete: () => {
        this.loadingProducts.set(false);
      },
    });
  }

  /**
   * Reinicia el formulario de venta para permitir la creación de una nueva venta después de guardar la actual.
   * Limpia los detalles de venta y restablece los campos del formulario a sus valores iniciales.
   */
  private resetFormForNextSale(): void {
    this.saleDetails.clear();
    this.saleForm.patchValue({
      documentType: 'CC',
      documentNumber: '',
    });
    this.saleForm.markAsPristine();
    this.saleForm.markAsUntouched();
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
