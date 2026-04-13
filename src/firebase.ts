import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Firebase 앱 초기화
// initializeApp은 설정 객체를 받아 Firebase 서비스를 시작합니다.
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 인스턴스 가져오기
// 두 번째 인자로 설정 파일에 정의된 특정 데이터베이스 ID를 사용합니다.
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Firebase 인증 인스턴스 가져오기
export const auth = getAuth(app);
