import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SalesService } from '../../../services/sales.service';
import { SaleHistory } from '../../../models/sale-history.model';

@Component({
  selector: 'app-lst-sale',
  imports: [DatePipe],
  templateUrl: './lst-sale.html',
  styleUrl: './lst-sale.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LstSale {
  private readonly salesService = inject(SalesService);

  readonly loading = signal(false);
  readonly loadError = signal('');
  readonly search = signal('');
  readonly vendedorFilter = signal('');
  readonly sales = signal<SaleHistory[]>([]);

  readonly vendedores = computed(() => {
    const unique = new Set(this.sales().map((sale) => sale.idVendedor));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  });

  readonly filteredSales = computed(() => {
    const searchValue = this.search().trim().toLowerCase();
    const vendedor = this.vendedorFilter().trim();

    return this.sales().filter((sale) => {
      const matchesVendedor = !vendedor || sale.idVendedor === vendedor;
      const matchesSearch =
        !searchValue ||
        sale.documentoCliente.toLowerCase().includes(searchValue) ||
        sale.idVendedor.toLowerCase().includes(searchValue) ||
        sale.detallesVentas.some((detail) => detail.idProducto.toLowerCase().includes(searchValue));

      return matchesVendedor && matchesSearch;
    });
  });

  constructor() {
    this.loadSales();
  }

  /**
   * Carga el listado de ventas realizadas desde el servicio.
   * Maneja el estado de carga y posibles errores.
   */
  loadSales(): void {
    this.loading.set(true);
    this.loadError.set('');

    this.salesService.sales().subscribe({
      next: (sales) => {
        this.sales.set(sales);
      },
      error: () => {
        this.loadError.set('No fue posible cargar el listado de ventas realizadas.');
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }
}
