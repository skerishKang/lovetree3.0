# LoveTree 3.0

LoveTree 3.0은 팬들의 좋아하는 순간을 트리 형태로 기록하고 연결하는 서비스의 프런트엔드 저장소입니다.

## 저장소 목적

이 저장소는 LoveTree 3.0 프런트엔드를 신규 구현하는 저장소입니다.
기존 `LoveBud` 저장소를 headless backend처럼 재사용한다는 원칙 아래, 프런트엔드를 모듈형으로 새로 구성합니다.

## 기존 LoveBud 저장소 원칙

- 기존 `skerishKang/LoveBud` 저장소는 별도 승인 전까지 **읽기 전용**입니다.
- LoveBud 저장소의 코드를 이 저장소에서 수정하지 않습니다.
- LoveBud의 API 계약은 기술 인수인계 문서를 통해 참조합니다.

## AI 개발 운영정책

LoveTree 3.0은 설계, 구현, 실환경 검증, 최종 승인, production 확인을 분리합니다.

표준 흐름:

사용자 요구
→ 웹 CTO 작업계약
→ 별도 웹 개발자 구현
→ GitHub CI
→ 로컬 실환경 검증
→ 웹 CTO 최종검토
→ 사용자 merge 승인
→ `main` 병합
→ Cloudflare Pages Git 자동배포
→ 웹 CTO production 확인

Cloudflare Pages는 이 저장소의 `main`과 Git integration으로 연결되어 있습니다. 승인된 PR이 `main`에 merge되면 production build와 deployment가 자동으로 시작됩니다. 웹 개발자와 로컬 검증자는 정상 경로에서 `wrangler pages deploy`, direct upload, dashboard retry, cache purge를 수행하지 않습니다. 수동 deployment는 자동배포 장애가 확인된 별도 운영사고에서 사용자 명시 승인 후에만 예외적으로 수행합니다.

저장소 작업자는 먼저 [AGENTS.md](AGENTS.md)를 읽어야 합니다.

상세 정책과 역할별 템플릿은
[docs/operations/README.md](docs/operations/README.md)를 참조하십시오.

## 현재 구현 상태

- **구현 완료 화면**: LT3-HOME-001 (홈 랜딩, 정적 구현)
- **구현 방식**: 정적 시각 구현 + 목업 데이터
- **API 연결**: 없음 (NOT_CONNECTED)
- **인증**: 없음
- **기타 화면**: 11개 화면이 화면 기준 자료로 등록되어 있으나 아직 구현되지 않았습니다.

화면 기준 자료 전체 목록은 [`docs/reference/SCREEN_INVENTORY.md`](docs/reference/SCREEN_INVENTORY.md)를 참조하세요.

## 기술 스택

- React 19
- TypeScript 6
- Vite 8
- CSS Modules + CSS Custom Properties
- Vitest
- React Testing Library
- oxlint

## 로컬 실행 방법

```bash
# 의존성 설치
npm ci

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 로컬 미리보기
npm run preview
```

## 검증 명령

```bash
# lint
npm run lint

# TypeScript 타입 검사
npm run typecheck

# 단위/컴포넌트 테스트
npm run test

# 프로덕션 빌드
npm run build
```

위 명령은 로컬 검증용입니다. `npm run build` 또는 `npm run preview`는 production deployment 명령이 아닙니다.

## 현재 구현 화면

- **LT3-HOME-001** — 홈 랜딩 (`/`)
  - 기준 해상도: 2752 × 1536 (Desktop)
  - 구현 상태: STATIC_IMPLEMENTED
  - API 상태: NOT_CONNECTED
  - 구현 증거: `docs/evidence/home-landing/`

## 화면 기준 자료 경로

```
docs/reference/screens/
├─ 00-home/         # 홈 랜딩
├─ 01-community/    # 커뮤니티 탐색
├─ 02-tree-detail/  # 트리 상세/타임라인
├─ 03-memory/       # 메모리 연결, 메모리 상세
├─ 04-media-search/ # 미디어 검색
├─ 05-editor/       # 빈 트리 에디터, 트리 에디터 캔버스
├─ 06-my-trees/     # 마이 트리 대시보드, 마이 트리 빈 상태
├─ 07-settings/     # 공개 범위 설정
└─ 08-auth/         # 로그인/마이페이지
```

전체 인벤토리는 `docs/reference/SCREEN_INVENTORY.md`를 참조하세요.

## 구현 증거 경로

```
docs/evidence/home-landing/
├─ implementation-desktop-2752x1536.png   # 데스크톱 구현 스크린샷
├─ implementation-mobile-390x1791.png     # 모바일 구현 스크린샷
└─ diff-original-vs-implementation.png   # 원본과 구현 비교 diff
```

## 미연결 항목 명시

다음 항목은 현재 구현에 **연결되어 있지 않습니다**.

- Firebase 인증
- LoveBud API 호출
- reverse proxy
- Cloudflare Pages Functions
- Modal
- Neon (데이터베이스)
- 트리 생성·수정·삭제
- 영상 재생
- 카드 메뉴 동작

모든 화면 데이터는 `src/data/mockData.ts`의 정적 목업 데이터입니다.

## 보안 원칙

- 비밀키, DB 주소, 토큰, Firebase service account JSON 등 실제 비밀값은 저장소에 포함하지 않습니다.
- `.env` 파일은 커밋하지 않으며 `.env.example`만 커밋 대상입니다. (현재 `.env.example`도 없습니다.)
- 로컬 절대경로가 포함된 민감한 설정은 저장소에 포함하지 않습니다.

## 기술 인수인계 문서

```
docs/handoff/LoveTree3_LoveBud_기술인수인계_2026-07-20.md
```

이 문서는 기존 LoveBud 저장소의 구조와 API 계약을 참조하기 위한 읽기 전용 자료입니다.
