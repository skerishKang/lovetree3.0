# LoveTree 3.0

LoveTree 3.0은 팬들이 좋아하는 순간을 트리 형태로 기록하고 연결하는 서비스의 프런트엔드 저장소입니다.

> **🔴 Live app:** Cloudflare Pages 자동 배포 대상 — wrangler.toml `name = "lovetree3"` 기준 도메인 미확정. Cloudflare Pages dashboard에서 Pages 프로젝트 도메인 확인 필요.

---

## Current product capability overview

| Capability | Route | Frontend | API Connection | Production Verification |
|---|---|---|---|---|
| Home landing | `/` | `SOURCE_IMPLEMENTED` | `NOT_CONNECTED` | `PENDING` |
| Community list | `/community` | `SOURCE_IMPLEMENTED` | `API_CONTRACT_PRESENT` (not wired to UI) | `PENDING` |
| Public tree detail | `/tree/:treeId` | `SOURCE_IMPLEMENTED` | `API_CONTRACT_PRESENT` | `PENDING` |
| Memory detail | `/tree/:treeId/memory/:memoryId` | `SOURCE_IMPLEMENTED` | `API_CONTRACT_PRESENT` | `PENDING` |
| Login (email/password) | `/login` | `SOURCE_IMPLEMENTED` | `FIREBASE_CONNECTED` | `PENDING` |
| Login (Google) | `/login` | `SOURCE_IMPLEMENTED` | `FIREBASE_CONNECTED` | `PENDING` |
| My trees list | `/my-trees` | `SOURCE_IMPLEMENTED` + `RequireAuth` | `API_CONTRACT_PRESENT` | `PENDING` |
| Create real tree | `/tree/new` | `SOURCE_IMPLEMENTED` + `RequireAuth` | `API_CONTRACT_PRESENT` | `PENDING` |
| Tree editor (canvas) | `/tree/edit-demo` | `DEMO_ONLY` | `NOT_CONNECTED` | — |
| New memory (demo) | `/tree/new-demo/*` | `DEMO_ONLY` | `NOT_CONNECTED` | — |
| Memory connect | `/memory/connect-demo` | `DEMO_ONLY` | `NOT_CONNECTED` | — |
| Media search | `/media/search-demo` | `DEMO_ONLY` | `NOT_CONNECTED` | — |
| Visibility settings | `/settings/visibility-demo` | `DEMO_ONLY` | `NOT_CONNECTED` | — |
| Likes | — | `NOT_IMPLEMENTED` | — | — |
| Comments | — | `UI_COMPONENT_EXISTS` (CommentSection) | `NOT_CONNECTED` | — |
| Share | — | `NOT_IMPLEMENTED` | — | — |
| Memory deletion | — | `NOT_IMPLEMENTED` | — | — |

> ⚠️ **Real routes** (`/my-trees`, `/tree/new`) are protected by `RequireAuth` and redirect unauthenticated users to `/login`. These work with Firebase Auth. However, the API client calls go to **LoveBud backend**, which must be separately deployed and accepting requests.

> ⚠️ **Demo routes** (`*-demo`) exist in App.tsx but are **not wired to real backend data**. They render UI components with mock/static data.

---

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

## Real routes (no /-demo suffix)

| Route | Component | Auth | Backend API |
|---|---|---|---|
| `/` | HomePage | Public | Mock data only |
| `/community` | CommunityPage | Public | `communityApi.fetchMain()` / `fetchGrowing()` (contract present) |
| `/login` | AuthLoginPage | Public | Firebase Auth (email/password + Google) |
| `/tree/:treeId` | TreeDetailPage | Public | `publicTreeDetail.api` (contract present) |
| `/tree/:treeId/memory/:memoryId` | MemoryDetailPage | Public | `publicMemoryDetail.api` (contract present) |
| `/my-trees` | MyTreesPage | `RequireAuth` → `/login` redirect | `myTreesApi.fetchTrees()` (contract present) |
| `/tree/new` | CreateTreePage | `RequireAuth` → `/login` redirect | `createTreeApi.createTree()` (contract present) |

## Demo-only routes (/-demo suffix, not connected to real data)

| Route | Component | Purpose |
|---|---|---|
| `/tree/new-demo` | EmptyTreeEditorPage | Empty tree onboarding visual |
| `/tree/new-demo/edit` | PublicDemoEditorPage | Tree editor canvas visual |
| `/tree/new-demo/memory/new` | PublicDemoMemoryFormPage | New memory form visual |
| `/tree/new-demo/memory/:nodeId/edit` | PublicDemoMemoryFormPage | Edit memory form visual |
| `/tree/new-demo/preview` | PublicDemoPreviewPage | Tree preview visual |
| `/memory/connect-demo` | MemoryConnectPage | Memory connection visual |
| `/memory/detail-demo` | MemoryDetailPage | Memory detail (same component as real route) |
| `/tree/edit-demo` | TreeEditorPage | Editor canvas visual |
| `/media/search-demo` | MediaSearchPage | Media search mock UI |
| `/settings/visibility-demo` | VisibilitySettingsPage | Visibility settings mock UI |
| `/my-trees/empty-demo` | MyTreesEmptyPage | Empty state visual |

## API connectivity

| Module | File | Status | LoveBud backend required |
|---|---|---|---|
| Auth (Firebase) | `src/api/auth.ts` | `CONNECTED` — Google + email/password | No (Firebase standalone) |
| API Client | `src/api/client.ts` | `IMPLEMENTED` — retry, 401 refresh, idempotency | Yes |
| Community | `src/api/community.ts` | `API_CONTRACT_PRESENT` — normalized response types | Yes |
| Create Tree | `src/api/createTree.ts` | `API_CONTRACT_PRESENT` — input validation + normalization | Yes |
| My Trees | `src/api/myTrees.ts` | `API_CONTRACT_PRESENT` — normalized response types | Yes |
| Public Tree Detail | `src/api/publicTreeDetail.ts` | `API_CONTRACT_PRESENT` | Yes |
| Public Memory Detail | `src/api/publicMemoryDetail.ts` | `API_CONTRACT_PRESENT` | Yes |

All API calls target `baseUrl` (default: `/api`). LoveBud backend must be deployed and accepting requests at this path for any real data flow.

## Known product gaps

| Gap | Severity | Current workaround |
|---|---|---|
| Create tree → add first real memory (broken flow) | **CRITICAL** — product chain breaks here | `/tree/new-demo/memory/new` (demo only) |
| Tree edit (real) | HIGH — no `/tree/:treeId/edit` route | `/tree/edit-demo` (demo only) |
| Memory connect to existing tree | HIGH — no real `/tree/:treeId/memory/connect` route | `/memory/connect-demo` (demo only) |
| Memory deletion | HIGH — not implemented at all | None |
| Visibility update | MEDIUM | `/settings/visibility-demo` (demo only) |
| Media search | MEDIUM | `/media/search-demo` (demo only) |
| Like / Comment | MEDIUM | CommentSection UI exists but not connected |
| Community API wired to UI | MEDIUM | API contract exists but page uses mock data |

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

## 보안 원칙

- 비밀키, DB 주소, 토큰, Firebase service account JSON 등 실제 비밀값은 저장소에 포함하지 않습니다.
- `.env` 파일은 커밋하지 않으며 `.env.example`만 커밋 대상입니다. (현재 `.env.example`도 없습니다.)
- 로컬 절대경로가 포함된 민감한 설정은 저장소에 포함하지 않습니다.

## 참조 문서

- [Screen Inventory](docs/reference/SCREEN_INVENTORY.md)
- [Current Product Capability Ledger](docs/operations/CURRENT_PRODUCT_CAPABILITY_LEDGER.md)
- [기술 인수인계 (LoveBud)](docs/handoff/LoveTree3_LoveBud_기술인수인계_2026-07-20.md)
- [AI 운영 정책](docs/operations/README.md)