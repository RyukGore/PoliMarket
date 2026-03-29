export interface SaleProductRequest {
  idProducto: string;
  cantidad: number;
}

export interface SaleRequest {
  idVendedor: string;
  documentoCliente: string;
  productos: SaleProductRequest[];
}
