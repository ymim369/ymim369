import Papa from 'papaparse';
import { SaleRecord } from '../types';

export const parseSalesCSV = (csvString: string): SaleRecord[] => {
  const { data } = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  return data.map((row: any) => ({
    orderId: row['주문번호'],
    productName: row['상품명'],
    price: parseInt(row['가격(원)'].replace(/,/g, ''), 10),
    date: new Date(row['날짜']),
    paymentMethod: row['결제방식'],
  }));
};
