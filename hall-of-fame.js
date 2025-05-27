// 공개 명예의 전당 관리 모듈 (Firebase Firestore 기반, 오늘 기록만 조회)
const HallOfFame = {
  COLLECTION_NAME: 'hall-of-fame',

  // Firebase 초기화 대기
  async waitForFirebase() {
    let attempts = 0;
    const maxAttempts = 50;
    while (attempts < maxAttempts) {
      if (window.firebaseDb && window.firebaseFirestore) return;
      await new Promise(res => setTimeout(res, 100));
      attempts++;
    }
    throw new Error('Firebase 초기화 대기 시간 초과');
  },

  // 초기화 (한 번만 호출)
  async initialize() {
    try {
      await this.waitForFirebase();
      console.log('🌐 명예의 전당 — Firestore 연결 성공');
    } catch (err) {
      console.error('❌ 명예의 전당 초기화 실패:', err);
    }
  },

  // 승자 추가 (점수 하드코딩: 10)
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

  // 오늘(00:00~24:00) 승자만 조회
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
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate().toISOString()
      }));
    } catch (err) {
      console.error('getWinners 에러:', err);
      return [];
    }
  },

  // 오늘 승자 중 이름 중복 체크
  async isDuplicateName(name) {
    const winners = await this.getWinners();
    return winners.some(w =>
      w.name.toLowerCase() === name.trim().toLowerCase()
    );
  },

  // 연결 상태 확인
  async checkConnection() {
    try {
      await this.waitForFirebase();
      return { status: 'connected', message: 'Firestore 연결됨' };
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  },

  // 오늘 명예의 전당 통계 조회 (승자 수)
  async getStats() {
    const winners = await this.getWinners();
    return { count: winners.length };
  }
};

// 전역에 노출
window.HallOfFame = HallOfFame;
