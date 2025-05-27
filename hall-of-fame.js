// 공개 명예의 전당 관리 모듈 (Firestore 기반, 오늘 기록만 조회)
const HallOfFame = {
  COLLECTION_NAME: 'hall-of-fame',

  // Firebase 초기화 대기 (최대 5초)
  async waitForFirebase() {
    let attempts = 0;
    while (attempts < 50) {
      if (window.firebaseDb && window.firebaseFirestore) return;
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    throw new Error('Firebase 초기화 대기 시간 초과');
  },

  // 모듈 초기화
  async initialize() {
    try {
      await this.waitForFirebase();
      console.log('🌐 명예의 전당 — Firestore 연결 성공');
    } catch (err) {
      console.error('❌ 명예의 전당 초기화 실패:', err);
    }
  },

  // 우승자 추가
  async addWinner(name) {
    await this.waitForFirebase();
    const { collection, addDoc, serverTimestamp } = window.firebaseFirestore;
    const data = {
      name: name.trim(),
      score: 10,
      timestamp: serverTimestamp()
    };
    const docRef = await addDoc(
      collection(window.firebaseDb, this.COLLECTION_NAME),
      data
    );
    console.log('🏅 명예의 전당 등록됨:', docRef.id, data);
    return { id: docRef.id, ...data };
  },

  // 오늘(00:00~24:00) 기록만 조회
  async getWinners() {
    try {
      await this.waitForFirebase();
      const { collection, getDocs, query, where, orderBy } = window.firebaseFirestore;
      const db = window.firebaseDb;

      const start = new Date(); 
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('timestamp', '>=', start),
        where('timestamp', '<', end),
        orderBy('timestamp', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name,
          score: d.score,
          timestamp: d.timestamp.toDate().toISOString()
        };
      });
    } catch (err) {
      console.error('❌ 공개 명예의 전당 조회 실패, 로컬 백업 사용:', err);
      // 에러 나면 빈 배열 리턴
      return [];
    }
  },

  // 오늘 중복 이름 검사
  async isDuplicateName(name) {
    const winners = await this.getWinners();
    const lower = name.trim().toLowerCase();
    return winners.some(w => w.name.toLowerCase() === lower);
  },

  // 연결 상태 확인
  async checkConnection() {
    try {
      await this.waitForFirebase();
      return { status: 'connected', message: 'Firestore 연결됨' };
    } catch (err) {
      return { status: 'error',   message: err.message };
    }
  }
};

// 전역에 노출
window.HallOfFame = HallOfFame;
