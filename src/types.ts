export interface SaleRecord {
  orderId: string;
  productName: string;
  price: number;
  date: Date;
  paymentMethod: string;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByDate: { date: string; amount: number }[];
  salesByProduct: { name: string; value: number }[];
  salesByPayment: { name: string; value: number }[];
}
