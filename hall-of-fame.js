// 공개 명예의 전당 관리 모듈 (Firebase Firestore 기반)
const HallOfFame = {
    // Firestore 컬렉션 이름
    COLLECTION_NAME: 'hall-of-fame',

    // Firebase 초기화 대기
    async waitForFirebase() {
        let attempts = 0;
        const maxAttempts = 50; // 5초 대기

        while (attempts < maxAttempts) {
            if (window.firebaseDb && window.firebaseFirestore) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        throw new Error('Firebase 초기화를 기다리는 중 시간 초과');
    },

    // 초기화
    async initialize() {
        try {
            await this.waitForFirebase();
            console.log('공개 명예의 전당 Firebase 연결 완료');
        } catch (error) {
            console.error('Firebase 연결 실패, 로컬 모드로 전환:', error);
            // Firebase 연결 실패 시 로컬 스토리지 백업 사용
            this.useLocalStorage = true;
            const existingData = localStorage.getItem('ox-quiz-hall-of-fame-backup');
            if (!existingData) {
                localStorage.setItem('ox-quiz-hall-of-fame-backup', JSON.stringify([]));
            }
        }
    },

    // 우승자 추가
    async addWinner(name) {
        try {
            if (this.useLocalStorage) {
                return await this.addWinnerLocal(name);
            }

            await this.waitForFirebase();
            const { collection, addDoc, serverTimestamp } = window.firebaseFirestore;

            const winnerData = {
                name: name.trim(),
                score: 10, // 10문제 모두 정답
                timestamp: serverTimestamp(),
                createdAt: new Date().toISOString() // 백업용 타임스탬프
            };

            const docRef = await addDoc(collection(window.firebaseDb, this.COLLECTION_NAME), winnerData);

            const newWinner = {
                id: docRef.id,
                ...winnerData,
                timestamp: new Date().toISOString() // 로컬 표시용
            };

            console.log('공개 명예의 전당에 추가됨:', newWinner);
            return newWinner;
        } catch (error) {
            console.error('공개 명예의 전당 추가 실패:', error);
            // 네트워크 오류 시 로컬 백업으로 저장
            return await this.addWinnerLocal(name);
        }
    },

    // 로컬 스토리지 백업 - 우승자 추가
    async addWinnerLocal(name) {
        try {
            const winners = JSON.parse(localStorage.getItem('ox-quiz-hall-of-fame-backup') || '[]');
            const newWinner = {
                id: Date.now(),
                name: name.trim(),
                score: 10,
                timestamp: new Date().toISOString(),
                isLocal: true // 로컬 데이터임을 표시
            };

            winners.unshift(newWinner);

            // 최대 100명까지만 저장
            if (winners.length > 100) {
                winners.splice(100);
            }

            localStorage.setItem('ox-quiz-hall-of-fame-backup', JSON.stringify(winners));
            console.log('로컬 백업에 추가됨:', newWinner);
            return newWinner;
        } catch (error) {
            console.error('로컬 백업 저장 실패:', error);
            throw error;
        }
    },

    // 우승자 목록 조회
    async getWinners() {
        try {
            if (this.useLocalStorage) {
                return await this.getWinnersLocal();
            }

            await this.waitForFirebase();
            const { collection, getDocs, query, orderBy, limit } = window.firebaseFirestore;

            const winnersQuery = query(
                collection(window.firebaseDb, this.COLLECTION_NAME),
                orderBy('timestamp', 'desc'),
                limit(100)
            );

            const querySnapshot = await getDocs(winnersQuery);
            const winners = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                winners.push({
                    id: doc.id,
                    name: data.name,
                    score: data.score,
                    timestamp: data.createdAt || data.timestamp || new Date().toISOString()
                });
            });

            return winners;
        } catch (error) {
            console.error('공개 명예의 전당 조회 실패, 로컬 백업 사용:', error);
            return await this.getWinnersLocal();
        }
    },

    // 로컬 스토리지 백업 - 우승자 목록 조회
    async getWinnersLocal() {
        try {
            const data = localStorage.getItem('ox-quiz-hall-of-fame-backup');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('로컬 백업 조회 실패:', error);
            return [];
        }
    },

    // 특정 우승자 조회
    async getWinner(id) {
        try {
            const winners = await this.getWinners();
            return winners.find(winner => winner.id === id);
        } catch (error) {
            console.error('우승자 조회 실패:', error);
            return null;
        }
    },

    // 통계 정보
    async getStats() {
        try {
            const winners = await this.getWinners();
            const now = new Date();
            const today = now.toDateString();
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            return {
                totalWinners: winners.length,
                todayWinners: winners.filter(winner => {
                    const winnerDate = new Date(winner.timestamp).toDateString();
                    return today === winnerDate;
                }).length,
                thisWeekWinners: winners.filter(winner => {
                    return new Date(winner.timestamp) >= weekAgo;
                }).length
            };
        } catch (error) {
            console.error('통계 조회 실패:', error);
            return {
                totalWinners: 0,
                todayWinners: 0,
                thisWeekWinners: 0
            };
        }
    },

    // 이름 중복 검사 (최근 24시간 내)
    async isDuplicateName(name) {
        try {
            const winners = await this.getWinners();
            const dayAgo = new Date();
            dayAgo.setDate(dayAgo.getDate() - 1);

            return winners.some(winner =>
                winner.name.toLowerCase() === name.toLowerCase() &&
                new Date(winner.timestamp) >= dayAgo
            );
        } catch (error) {
            console.error('이름 중복 검사 실패:', error);
            return false;
        }
    },

    // 연결 상태 확인
    async checkConnection() {
        try {
            if (this.useLocalStorage) {
                return { status: 'local', message: '로컬 모드로 실행 중' };
            }

            await this.waitForFirebase();
            return { status: 'connected', message: 'Firebase 연결됨' };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    },

    // 네트워크 재연결 시도
    async reconnect() {
        try {
            this.useLocalStorage = false;
            await this.initialize();
            return await this.checkConnection();
        } catch (error) {
            console.error('재연결 실패:', error);
            return { status: 'error', message: '재연결 실패' };
        }
    }
};

// 전역에서 사용할 수 있도록 노출
window.HallOfFame = HallOfFame;

