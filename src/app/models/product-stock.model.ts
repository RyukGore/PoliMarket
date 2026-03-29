export interface ProductStockItem {
  cantidad: number;
  idInventario: string;
  idProducto: string;
}

export interface ProductStock {
  idProducto: string;
  nombre: string;
  precio: number;
  stoks: ProductStockItem[];
}
