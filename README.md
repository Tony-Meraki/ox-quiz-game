# 상식 무작위 OX 게임 🌸

귀엽고 재미있는 상식 퀴즈 게임입니다! 10문제를 모두 맞히면 공개 명예의 전당에 이름을 올릴 수 있어요.

## 🎮 게임 특징

- **다양한 카테고리**: 일반상식, IT, 정치, 금융, 경제, 엔터테인먼트, 문화
- **공개 명예의 전당**: 10문제 모두 정답 시 모든 사용자가 볼 수 있는 명예의 전당 등록
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기에서 최적화
- **귀여운 디자인**: 파스텔 톤과 부드러운 애니메이션

## 🚀 배포 방법

1. GitHub 리포지토리 생성 후 코드 업로드
2. [Vercel](https://vercel.com)에서 Import Project
3. 자동 배포 완료

1. GitHub 리포지토리 생성 후 코드 업로드
2. [Netlify](https://netlify.com)에서 New site from Git
3. 자동 배포 완료

## 🔧 Firebase 설정 (선택사항)

공개 명예의 전당 기능을 위해 Firebase Firestore를 사용합니다.

1. [Firebase Console](https://console.firebase.google.com)에서 프로젝트 생성
2. Firestore Database 활성화
3. `index.html`의 Firebase 설정 수정:

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

