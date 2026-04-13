import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  limit, 
  orderBy, 
  onSnapshot,
  Timestamp,
  writeBatch,
  doc
} from 'firebase/firestore';
import { db } from '../firebase';
import { SaleRecord } from '../types';
import { parseSalesCSV } from '../utils/dataParser';

const COLLECTION_NAME = 'sales_data';

/**
 * Firestore에서 판매 데이터를 실시간으로 가져오는 함수
 * @param callback 데이터가 업데이트될 때 실행될 콜백 함수
 */
export const subscribeToSalesData = (callback: (data: SaleRecord[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
  
  // onSnapshot은 실시간 리스너를 설정합니다.
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        ...docData,
        // Firestore의 Timestamp를 JavaScript Date 객체로 변환
        date: (docData.date as Timestamp).toDate()
      } as SaleRecord;
    });
    callback(data);
  }, (error) => {
    console.error("Firestore 구독 에러:", error);
  });
};

/**
 * 초기 데이터를 Firestore에 시딩(Seed)하는 함수
 * 컬렉션이 비어있을 경우에만 실행됩니다.
 */
export const seedInitialData = async (csvString: string) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), limit(1));
    const snapshot = await getDocs(q);
    
    // 데이터가 이미 있으면 시딩을 건너뜁니다.
    if (!snapshot.empty) {
      console.log("데이터가 이미 존재하여 시딩을 건너뜁니다.");
      return;
    }

    console.log("초기 데이터 시딩 시작...");
    const parsedData = parseSalesCSV(csvString);
    
    // 대량 쓰기를 위해 Batch 사용
    const batch = writeBatch(db);
    
    parsedData.forEach((item) => {
      const docRef = doc(collection(db, COLLECTION_NAME));
      batch.set(docRef, {
        ...item,
        // Date 객체를 Firestore Timestamp로 변환
        date: Timestamp.fromDate(item.date)
      });
    });

    await batch.commit();
    console.log("초기 데이터 시딩 완료!");
  } catch (error) {
    console.error("시딩 중 오류 발생:", error);
  }
};

/**
 * 새로운 판매 기록을 Firestore에 추가하는 함수
 */
export const addSaleRecord = async (record: SaleRecord) => {
  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      ...record,
      date: Timestamp.fromDate(record.date)
    });
  } catch (error) {
    console.error("데이터 추가 중 오류 발생:", error);
  }
};
