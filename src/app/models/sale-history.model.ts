export interface SaleDetailHistory {
  idVenta: string;
  cantidad: number;
  idProducto: string;
  nombreProducto: string;
}

export interface SaleHistory {
  idVenta: string;
  documentoCliente: string;
  fecha: string;
  idVendedor: string;
  detallesVentas: SaleDetailHistory[];
}
