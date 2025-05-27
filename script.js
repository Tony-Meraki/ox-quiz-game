// 게임 상태 관리
let gameState = {
    currentQuizData: [],
    currentQuestion: 0,
    selectedCategory: '전체',
    correctAnswers: 0,
    totalQuestions: 10
};

// DOM 요소들
const elements = {
    homeScreen: document.getElementById('home-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    successScreen: document.getElementById('success-screen'),
    failureScreen: document.getElementById('failure-screen'),
    hallScreen: document.getElementById('hall-screen'),
    startQuizBtn: document.getElementById('start-quiz-btn'),
    categoryTabs: document.getElementById('category-tabs'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    categoryBadge: document.getElementById('category-badge'),
    questionText: document.getElementById('question-text'),
    oBtn: document.getElementById('o-btn'),
    xBtn: document.getElementById('x-btn'),
    winnerName: document.getElementById('winner-name'),
    submitNameBtn: document.getElementById('submit-name-btn'),
    restartSuccessBtn: document.getElementById('restart-success-btn'),
    correctAnswer: document.getElementById('correct-answer'),
    retryBtn: document.getElementById('retry-btn'),
    homeBtn: document.getElementById('home-btn'),
    viewHallBtn: document.getElementById('view-hall-btn'),
    backHomeBtn: document.getElementById('back-home-btn'),
    hallOfFamePreview: document.getElementById('hall-of-fame-preview'),
    hallOfFameList: document.getElementById('hall-of-fame-list')
};

// 퀴즈 데이터 로드
let quizData = [];

async function loadQuizData() {
    try {
        const response = await fetch('quiz-data.json');
        quizData = await response.json();
        console.log('퀴즈 데이터 로드 완료:', quizData.length, '개 문제');
    } catch (error) {
        console.error('퀴즈 데이터 로드 실패:', error);
        // 백업 데이터 사용
        quizData = getBackupQuizData();
    }
}

// 백업 퀴즈 데이터
function getBackupQuizData() {
    return [
        {"category": "일반상식", "question": "물의 끓는점은 섭씨 100도이다.", "answer": "O"},
        {"category": "IT", "question": "HTML은 프로그래밍 언어이다.", "answer": "X"},
        {"category": "정치", "question": "대한민국의 대통령 임기는 5년이다.", "answer": "O"},
        {"category": "금융", "question": "주식 가격은 항상 상승한다.", "answer": "X"},
        {"category": "경제", "question": "물가가 지속적으로 하락하는 현상을 인플레이션이라고 한다.", "answer": "X"},
        {"category": "엔터테인먼트", "question": "영화 '기생충'의 감독은 봉준호이다.", "answer": "O"},
        {"category": "문화", "question": "세종대왕은 한글을 창제했다.", "answer": "O"},
        {"category": "일반상식", "question": "지구는 태양 주위를 돈다.", "answer": "O"},
        {"category": "IT", "question": "스마트폰 운영체제 안드로이드는 구글에서 개발했다.", "answer": "O"},
        {"category": "정치", "question": "국회의원 선거는 비례대표제와 지역구제로 나뉜다.", "answer": "O"}
    ];
}

// 카테고리별 문제 필터링
function getFilteredQuestions(category) {
    if (category === '전체') {
        return [...quizData];
    }
    return quizData.filter(q => q.category === category);
}

// 문제 셔플
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 화면 전환
function showScreen(screenName) {
    Object.values(elements).forEach(el => {
        if (el && el.classList && el.classList.contains('hidden')) return;
        if (el && el.id && el.id.includes('-screen')) {
            el.classList.add('hidden');
        }
    });

    const targetScreen = elements[screenName];
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }
}

// 카테고리 탭 초기화
function initializeCategoryTabs() {
    const tabsContainer = elements.categoryTabs;

    tabsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-tab')) {
            // 모든 탭 비활성화
            tabsContainer.querySelectorAll('.category-tab').forEach(tab => {
                tab.classList.remove('active');
            });

            // 선택된 탭 활성화
            e.target.classList.add('active');
            gameState.selectedCategory = e.target.dataset.category;
        }
    });

    // 첫 번째 탭(전체) 활성화
    tabsContainer.querySelector('.category-tab').classList.add('active');
}

// 퀴즈 시작
function startQuiz() {
    const filteredQuestions = getFilteredQuestions(gameState.selectedCategory);
    gameState.currentQuizData = shuffleArray(filteredQuestions).slice(0, gameState.totalQuestions);
    gameState.currentQuestion = 0;
    gameState.correctAnswers = 0;

    if (gameState.currentQuizData.length < gameState.totalQuestions) {
        alert(`선택한 카테고리에 문제가 부족합니다. (${gameState.currentQuizData.length}개 문제만 있음)`);
        gameState.totalQuestions = gameState.currentQuizData.length;
    }

    showScreen('quizScreen');
    displayQuestion();
}

// 문제 표시
function displayQuestion() {
    const question = gameState.currentQuizData[gameState.currentQuestion];

    // 진행률 업데이트
    const progress = ((gameState.currentQuestion + 1) / gameState.totalQuestions) * 100;
    elements.progressBar.style.width = `${progress}%`;
    elements.progressText.textContent = `${gameState.currentQuestion + 1}/${gameState.totalQuestions}`;

    // 카테고리 뱃지 업데이트
    elements.categoryBadge.textContent = question.category;

    // 질문 텍스트 업데이트
    elements.questionText.textContent = question.question;

    // 버튼 활성화
    elements.oBtn.disabled = false;
    elements.xBtn.disabled = false;
    elements.oBtn.classList.remove('opacity-50');
    elements.xBtn.classList.remove('opacity-50');
}

// 답안 처리
function submitAnswer(userAnswer) {
    const currentQuestion = gameState.currentQuizData[gameState.currentQuestion];
    const isCorrect = userAnswer === currentQuestion.answer;

    // 버튼 비활성화
    elements.oBtn.disabled = true;
    elements.xBtn.disabled = true;

    if (isCorrect) {
        gameState.correctAnswers++;
        gameState.currentQuestion++;

        // 다음 문제로 넘어가기
        setTimeout(() => {
            if (gameState.currentQuestion < gameState.totalQuestions) {
                displayQuestion();
            } else {
                // 모든 문제를 맞힌 경우
                showScreen('successScreen');
            }
        }, 500);
    } else {
        // 틀린 경우
        elements.correctAnswer.textContent = currentQuestion.answer === 'O' ? '정답 (O)' : '오답 (X)';
        setTimeout(() => {
            showScreen('failureScreen');
        }, 500);
    }
}

// 명예의 전당에 이름 추가
async function addToHallOfFame(name) {
    if (!name.trim()) {
        alert('이름을 입력해주세요!');
        return;
    }

    // 이름 길이 제한 (최대 20자)
    if (name.trim().length > 20) {
        alert('이름은 20자 이내로 입력해주세요!');
        return;
    }

    // 특수문자 제한
    const namePattern = /^[가-힣a-zA-Z0-9\s]+$/;
    if (!namePattern.test(name.trim())) {
        alert('이름에는 한글, 영문, 숫자만 사용할 수 있습니다!');
        return;
    }

    try {
        // 로딩 상태 표시
        elements.submitNameBtn.disabled = true;
        elements.submitNameBtn.innerHTML = '<div class="loading-spinner inline-block mr-2"></div>등록 중...';

        // 중복 이름 확인 (24시간 내)
        const isDuplicate = await HallOfFame.isDuplicateName(name.trim());
        if (isDuplicate) {
            alert('같은 이름이 최근 24시간 내에 등록되었습니다. 다른 이름을 사용해주세요!');
            return;
        }

        await HallOfFame.addWinner(name.trim());
        await updateHallOfFameDisplay();
        showScreen('hallScreen');

        // 성공 메시지
        setTimeout(() => {
            alert('🎉 축하합니다! 공개 명예의 전당에 등록되었습니다!');
        }, 500);

    } catch (error) {
        console.error('명예의 전당 추가 실패:', error);
        alert('명예의 전당 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
        // 로딩 상태 해제
        elements.submitNameBtn.disabled = false;
        elements.submitNameBtn.innerHTML = '🏆 명예의 전당 등록';
    }
}

// 명예의 전당 표시 업데이트
async function updateHallOfFameDisplay() {
    try {
        // 로딩 상태 표시
        elements.hallOfFamePreview.innerHTML = '<div class="flex items-center justify-center gap-2"><div class="loading-spinner"></div><span>로딩 중...</span></div>';
        elements.hallOfFameList.innerHTML = '<div class="flex items-center justify-center gap-2"><div class="loading-spinner"></div><span>로딩 중...</span></div>';

        const winners = await HallOfFame.getWinners();
        const connectionStatus = await HallOfFame.checkConnection();

        // 연결 상태 표시
        const statusIndicator = connectionStatus.status === 'connected'
            ? '<span class="text-green-500 text-xs">🌐 실시간</span>'
            : '<span class="text-yellow-500 text-xs">📱 로컬</span>';

        // 미리보기 (최근 5명)
        const preview = winners.slice(0, 5);
        if (preview.length === 0) {
            elements.hallOfFamePreview.innerHTML = `
                <p class="text-gray-500">아직 명예의 전당이 비어있어요! 첫 번째 도전자가 되어보세요! 🌟</p>
                <div class="mt-2">${statusIndicator}</div>
            `;
        } else {
            elements.hallOfFamePreview.innerHTML = `
                ${preview.map((winner, index) =>
                    `<div class="flex justify-between items
-center py-2 border-b border-pink-100 last:border-b-0">
                        <span class="font-medium">${index + 1}. ${winner.name} ${winner.isLocal ? '(로컬)' : ''}</span>
                        <span class="text-sm text-gray-500">${new Date(winner.timestamp).toLocaleDateString()}</span>
                    </div>`
                ).join('')}
                <div class="mt-2 text-center">${statusIndicator}</div>
            `;
        }

        // 전체 목록
        if (winners.length === 0) {
            elements.hallOfFameList.innerHTML = `
                <p class="text-gray-500 text-center">아직 명예의 전당이 비어있어요! 첫 번째 도전자가 되어보세요! 🌟</p>
                <div class="mt-4 text-center">${statusIndicator}</div>
            `;
        } else {
            elements.hallOfFameList.innerHTML = `
                ${winners.map((winner, index) =>
                    `<div class="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 flex justify-between items-center border border-pink-100">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">${index < 3 ? ['🥇', '🥈', '🥉'][index] : '🏆'}</span>
                            <span class="font-bold text-lg">${winner.name} ${winner.isLocal ? '(로컬)' : ''}</span>
                        </div>
                        <span class="text-sm text-gray-600">${new Date(winner.timestamp).toLocaleDateString()}</span>
                    </div>`
                ).join('')}
                <div class="mt-4 text-center">${statusIndicator}</div>
            `;
        }

        // 통계 정보 표시
        const stats = await HallOfFame.getStats();
        if (stats.totalWinners > 0) {
            const statsHtml = `
                <div class="mt-4 text-center text-sm text-gray-600 bg-pink-50 rounded-lg p-3">
                    <div class="flex justify-center gap-4">
                        <span>총 ${stats.totalWinners}명</span>
                        <span>오늘 ${stats.todayWinners}명</span>
                        <span>이번주 ${stats.thisWeekWinners}명</span>
                    </div>
                </div>
            `;
            elements.hallOfFameList.innerHTML += statsHtml;
        }

    } catch (error) {
        console.error('명예의 전당 표시 오류:', error);
        elements.hallOfFamePreview.innerHTML = '<p class="text-red-500">로딩 중 오류가 발생했습니다. 페이지를 새로고침해주세요.</p>';
        elements.hallOfFameList.innerHTML = '<p class="text-red-500">로딩 중 오류가 발생했습니다. 페이지를 새로고침해주세요.</p>';
    }
}

// 이벤트 리스너 등록
function addEventListeners() {
    // 퀴즈 시작
    elements.startQuizBtn.addEventListener('click', startQuiz);

    // O/X 답안 버튼
    elements.oBtn.addEventListener('click', () => submitAnswer('O'));
    elements.xBtn.addEventListener('click', () => submitAnswer('X'));

    // 명예의 전당 이름 제출
    elements.submitNameBtn.addEventListener('click', () => {
        addToHallOfFame(elements.winnerName.value);
    });

    // 엔터키로 이름 제출
    elements.winnerName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addToHallOfFame(elements.winnerName.value);
        }
    });

    // 다시 시작 버튼들
    elements.restartSuccessBtn.addEventListener('click', () => {
        elements.winnerName.value = '';
        showScreen('homeScreen');
    });

    elements.retryBtn.addEventListener('click', startQuiz);
    elements.homeBtn.addEventListener('click', () => showScreen('homeScreen'));

    // 명예의 전당 보기
    elements.viewHallBtn.addEventListener('click', () => showScreen('hallScreen'));
    elements.backHomeBtn.addEventListener('click', () => showScreen('homeScreen'));
}

// 초기화
async function initialize() {
    try {
        await loadQuizData();
        await HallOfFame.initialize();
        await updateHallOfFameDisplay();
        initializeCategoryTabs();
        addEventListeners();

        console.log('게임 초기화 완료');

        // 연결 상태 확인 및 표시
        const connectionStatus = await HallOfFame.checkConnection();
        if (connectionStatus.status === 'local') {
            console.warn('⚠️ Firebase 연결 실패 - 로컬 모드로 실행됩니다.');
        } else if (connectionStatus.status === 'connected') {
            console.log('✅ Firebase 연결 성공 - 공개 명예의 전당이 활성화되었습니다.');
        }

    } catch (error) {
        console.error('게임 초기화 중 오류 발생:', error);
        alert('게임 초기화 중 문제가 발생했습니다. 페이지를 새로고침해주세요.');
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initialize);

// 네트워크 상태 변경 감지
window.addEventListener('online', async () => {
    console.log('네트워크 연결됨 - Firebase 재연결 시도');
    const result = await HallOfFame.reconnect();
    if (result.status === 'connected') {
        await updateHallOfFameDisplay();
        console.log('Firebase 재연결 성공');
    }
});

window.addEventListener('offline', () => {
    console.log('네트워크 연결 끊김 - 로컬 모드로 전환됩니다.');
});

