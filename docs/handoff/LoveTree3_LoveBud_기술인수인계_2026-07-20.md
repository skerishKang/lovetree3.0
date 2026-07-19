# LoveTree 3.0 기술 인수인계 문서

## 0. 문서 목적과 검증 기준

### 0.1 프로젝트 구분

* **신규 GPT 프로젝트:** 러브트리 3.0
* **신규 프런트엔드 저장소:** `skerishKang/lovetree3.0`
* **기존 백엔드·운영 저장소:** `skerishKang/LoveBud`
* **기존 공식 운영 주소:** `https://lovebud.pages.dev/`
* **기본 전략:** LoveTree 3.0은 화면과 프런트엔드 구조를 새로 구현하되, 기존 LoveBud의 인증·API·데이터베이스·권한·도메인 로직을 재사용한다.

공식 운영 주소와 기존 저장소 주소는 사용자 제공 자료와 저장소 README에서 일치한다.

### 0.2 조사 기준

* **확인일:** 2026년 7월 20일
* **확인 브랜치:** `main`
* **확인된 최신 main SHA:** `92270d0012a4970657477c6f28008423fe74f3d2`
* **최신 커밋:** `ux(my-trees): make entries appreciation-first (#3597)`
* 기존 LoveBud 저장소는 변경하지 않고 읽기 전용으로 조사했다.
* 최신 운영 문서, API 계약 문서, 실제 Cloudflare Pages Function, Modal 코드, 인증 코드, 데이터 쓰기 코드를 교차 확인했다.
* 이 문서 작성 환경에서는 저장소 clone과 테스트 실행이 완료되지 않았다. 따라서 테스트 명령과 계약은 소스에서 확인했지만, 현재 SHA의 테스트 결과를 임의로 `PASS`라고 판정하지 않는다.
* 비밀키, 서비스 계정 JSON, 실제 토큰, 비밀번호, 실제 데이터베이스 주소, 사용자 개인정보는 포함하지 않는다.

### 0.3 원천 우선순위

코드와 문서가 충돌하면 다음 순서로 판단한다.

1. 현재 `main`의 실제 런타임 코드
2. `docs/ops/OPERATIONS.md`
3. `README.md`, `AGENTS.md`
4. `docs/engineering/API_CONTRACT.md`
5. 과거 migration·audit·conversation 문서

---

# 1. 현재 LoveBud 운영 구조

## 1.1 전체 구조

```text
사용자 브라우저
    │
    │ HTTPS
    ▼
Cloudflare Pages
- 정적 HTML/CSS/JS 제공
- 공식 사용자 진입점
- same-origin /api/* 제공
    │
    │ Cloudflare Pages Functions
    │ Authorization 헤더 전달
    ▼
Modal / FastAPI
- Firebase ID Token 검증
- 권한 검사
- 도메인 로직
- 공개/비공개 정책
- CRUD 및 소셜 기능
    │
    │ DATABASE_URL
    ▼
Neon PostgreSQL

별도 인증 계층:
브라우저 ── Firebase Auth
Modal ── Firebase 공개 인증서로 ID Token 검증
Modal ── Firebase Admin/Firestore로 Plus entitlement 확인
```

현재 공식 운영 계층은 `Cloudflare Pages → Pages Functions → Modal → Neon`이다. Firebase는 로그인과 사용자 토큰 발급을 담당한다.

## 1.2 계층별 실제 역할

| 계층                         | 실제 역할                                                      | LoveTree 3.0 판단      |
| -------------------------- | ---------------------------------------------------------- | -------------------- |
| Cloudflare Pages           | 공식 프런트엔드 제공, 정적 파일 배포, same-origin `/api/*` 진입점            | 신규 저장소에서도 같은 역할을 권고  |
| Cloudflare Pages Functions | 브라우저 요청 검증, 인증 헤더 전달, body 크기 제한, timeout, Modal 프록시       | 최소 연결 계층만 신규 저장소에 구현 |
| Modal                      | FastAPI 기반 활성 백엔드, 인증 검증, 소유권·공개 범위 검사, CRUD·소셜 도메인 로직     | 기존 배포를 그대로 재사용       |
| Neon PostgreSQL            | 트리·기억·댓글·반응·조회·배치 상태 등 영속 데이터                              | 기존 DB 그대로 재사용        |
| Firebase Auth              | Google 로그인, 로그인 상태 유지, ID Token 발급                         | 같은 Firebase 프로젝트 재사용 |
| Firestore                  | 현재 코드에서는 Plus/private storage entitlement 판정에 사용           | 기존 정책 재사용            |
| Vercel                     | deprecated transitional artifact 또는 fallback 후보로 문서에 남아 있음 | 신규 프로젝트 의존 금지        |
| Netlify                    | active runtime이 아니며 함수 구현은 제거됨. README형 레거시 흔적만 남을 수 있음    | 가져오지 않음              |

운영 문서는 Cloudflare Pages를 Primary Entry/API Router, Modal을 Active API/Backend Target으로 규정한다. Netlify는 신규 구현 금지 계층이다.

## 1.3 공식 프런트엔드 진입점

기존 LoveBud는 번들러 기반 SPA가 아니라 독립 HTML 진입점과 전역 `window.*` 네임스페이스를 사용하는 정적 사이트다.

현재 주요 파일은 다음과 같다.

```text
index.html
pages/intro.html
pages/search.html
pages/detail.html
pages/editor.html
pages/my-trees.html
pages/login.html
```

Cloudflare Pages 사용자 경로는 다음과 같이 노출된다.

```text
/
 /intro.html 또는 /pages/intro
 /search.html 또는 /pages/search
 /detail.html 또는 /pages/detail
 /editor.html 또는 /pages/editor
 /my-trees.html 또는 /pages/my-trees
 /login.html 또는 /pages/login
```

기존 `_redirects`는 `.html` 주소를 `/pages/<name>` 경로로 정규화한다. 이 파일은 현재 Cloudflare Pages 라우트 정규화 역할이므로 Netlify 전용 파일로 보면 안 된다.

LoveTree 3.0에서는 이 HTML·전역 스크립트 구조를 그대로 복제할 필요가 없다. 새 프런트엔드 기술 스택에 맞춰 라우팅을 새로 구성하되, 사용자 흐름과 API 계약만 유지한다.

## 1.4 Cloudflare Pages Functions

현재 브라우저-facing API의 실제 구현 위치다.

```text
functions/api/trees.js
functions/api/trees/[id].js
functions/api/memories.js
functions/api/memories/[id].js
functions/api/[[path]].js
functions/api/memories/[id]/reactions.js
functions/api/memories/[id]/comments.js
functions/api/trees/[tree_id]/likes.js
functions/api/trees/[tree_id]/comments.js
functions/api/trees/[tree_id]/views.js
functions/api/trees/[tree_id]/memories/[memory_id]/reactions.js
functions/api/trees/[tree_id]/memories/[memory_id]/comments.js
functions/api/comments/[id].js
functions/api/youtube/oembed.js
functions/api/scout/suggest.js
functions/api/scout/save-memory.js
functions/_shared/memory-route-proxy.js
```

주요 책임은 다음과 같다.

* 브라우저가 `/api/*`만 호출하도록 유지
* `Authorization: Bearer <Firebase ID Token>` 전달
* `Idempotency-Key` 검사 및 전달
* JSON 요청 body 크기 제한
* Modal 호출 timeout
* 요청 ID 발급 및 전달
* Modal 장애 시 503 또는 504 응답
* 공개 GET의 제한적 캐시
* 알 수 없는 API 경로의 404/405 처리

현재 주요 write body 상한은 128KB이며, Modal upstream timeout은 많은 경로에서 25초다.

## 1.5 Modal

`modal_compute/app.py`의 FastAPI 애플리케이션이 활성 백엔드다.

주요 책임:

* Firebase ID Token 검증
* Firebase UID를 신뢰 가능한 사용자 식별자로 확정
* 트리 소유권 확인
* 공개·비공개 접근 통제
* Plus 사용자만 private storage 허용
* 트리·기억 CRUD
* 공개 Browse 데이터 집계
* 공개 상세 데이터 정규화
* 댓글·반응·트리 좋아요·조회수
* 중복 쓰기 방지
* rate limit 및 social write audit
* Neon 연결과 트랜잭션 관리

Modal은 브라우저 토큰의 `aud`, `iss`, 서명, `uid/sub`를 검사하고 잘못된 토큰은 401로 거절한다.

## 1.6 Neon/PostgreSQL

Modal은 `DATABASE_URL`을 사용해 psycopg3 connection pool을 구성한다.

현재 코드상 설정:

* 최소 pool size: 1
* 최대 pool size: 4
* 연결 timeout: 10초
* statement timeout: 20초
* pool acquire timeout: 15초
* 일부 read 작업은 연결 오류 시 최대 3회 재시도

DB 접근은 브라우저나 Cloudflare Pages Function에서 직접 하지 않는다. 반드시 Modal을 통한다.

## 1.7 Firebase Auth

기존 프런트는 Firebase v8 compat SDK를 사용한다.

```text
firebase-app.js
firebase-auth.js
js/firebase-config.js
js/auth/auth-state.js
js/auth/auth-callbacks.js
js/auth/auth-cache.js
js/auth/auth-ui.js
js/auth/auth-session.js
js/auth/auth-firebase.js
js/auth.js
```

`js/firebase-config.js`가 클라이언트 초기화의 현재 단일 원천이다. 실제 설정값은 이 문서에 옮기지 않는다.

## 1.8 Vercel

`vercel.json`은 남아 있지만 파일 자체에 다음 의미가 명시돼 있다.

* deprecated transitional fallback only
* active production이 아님
* 일부 과거 `.html → pages/*.html` rewrite 보존용

LoveTree 3.0에 복사하지 않는다.

또한 현재 `main`의 실제 Pages Function 코드에서는 `LOVEBUD_UPSTREAM_ORIGIN`을 사용하는 활성 경로를 확인하지 못했다. 해당 이름은 주로 운영·이행 문서에 남아 있다. 따라서 Vercel fallback을 신규 프로젝트의 런타임 전제로 삼아서는 안 된다.

## 1.9 Netlify

현재 Netlify는 활성 백엔드가 아니다.

* `netlify.toml` 없음
* 활성 `netlify/functions/*` 없음
* 레거시 registry 기준으로 `netlify/` 아래에는 설명용 README만 남는 구조
* 신규 API나 정책을 Netlify에 구현하면 안 됨

레거시 registry도 Netlify 폴더를 “README만 존재하고 live function과 SQL script는 없는 배포 레거시”로 규정한다.

---

# 2. 브라우저와 API 계약

## 2.1 same-origin `/api/*` 원칙

브라우저 코드는 다음 규칙을 지켜야 한다.

```text
올바른 호출
https://<lovetree3-domain>/api/trees

피해야 할 호출
https://lovebud.pages.dev/api/trees
https://<modal-domain>/modal/private/trees
https://<neon-host>/...
```

LoveTree 3.0 브라우저에서 기존 LoveBud 도메인의 API나 Modal을 직접 호출하지 않는다. 새 도메인의 `/api/*`를 호출하고, 새 저장소의 Pages Function이 서버 측에서 기존 API로 전달해야 한다.

기존 LoveBud도 `window.apiClient → base-api-fetch.js → same-origin /api/*` 구조를 사용한다.

## 2.2 전송 형식

기본 규칙:

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <Firebase ID Token>
```

* API의 canonical field naming은 **flat camelCase**
* 신규 코드에서 snake_case나 `{id, data:{...}}`를 생성하지 않음
* 기존 클라이언트에는 과거 데이터 호환용 adapter가 남아 있음
* 날짜·시간은 응답에서 ISO 문자열 또는 `null`
* ID는 프런트엔드에서 문자열로 처리

현재 API 계약은 flat camelCase를 정식 표준으로 선언한다.

## 2.3 주요 API 경로

### A. 트리

| 메서드    | 경로                                      | 인증 | 역할                               |
| ------ | --------------------------------------- | -: | -------------------------------- |
| GET    | `/api/trees?limit=100`                  | 필요 | 로그인 사용자의 트리 목록                   |
| POST   | `/api/trees`                            | 필요 | 트리 생성                            |
| GET    | `/api/trees/:treeId`                    | 선택 | 인증 시 owner/private 우선, 아니면 공개 상세 |
| PUT    | `/api/trees/:treeId`                    | 필요 | 제목·공개 범위·메타데이터 수정                |
| DELETE | `/api/trees/:treeId`                    | 필요 | 트리와 하위 기억 삭제                     |
| POST   | `/api/trees/:treeId/fork`               | 필요 | 공개 트리 복사                         |
| GET    | `/api/private/trees/:treeId/capability` | 필요 | owner/기능 capability 조회           |

### B. 기억 또는 순간

| 메서드    | 경로                                       | 인증 | 역할                                   |
| ------ | ---------------------------------------- | -: | ------------------------------------ |
| GET    | `/api/memories?treeId=:treeId&limit=100` | 필요 | 소유 트리의 기억 목록                         |
| POST   | `/api/memories`                          | 필요 | 기억 생성                                |
| GET    | `/api/memories/:memoryId`                | 선택 | 인증 시 private read, 비인증 시 public read |
| PUT    | `/api/memories/:memoryId`                | 필요 | 기억 수정                                |
| DELETE | `/api/memories/:memoryId`                | 필요 | 기억 삭제                                |

트리·기억 collection의 기본 limit은 100이며 최대 200으로 제한된다. write는 인증 헤더를 요구한다.

### C. 공개 Browse

| 메서드 | 경로                                                        | 역할               |
| --- | --------------------------------------------------------- | ---------------- |
| GET | `/api/community/trees?view=summary&sort=latest&limit=:n`  | 공개 트리 summary    |
| GET | `/api/community/trees?view=summary&sort=popular&limit=:n` | 인기 기준 summary    |
| GET | `/api/community/trees?view=summary&sort=likes&limit=:n`   | 좋아요 기준 summary   |
| GET | `/api/community/trees?view=summary&sort=views&limit=:n`   | 조회수 기준 summary   |
| GET | `/api/community/growing-trees?limit=:n`                   | 성장 중 트리          |
| GET | `/api/community/memories?treeId=:treeId&limit=:n`         | 공개 트리 기억 hydrate |

Browse summary의 최대 limit은 현재 60이며, growing trees는 3~12 범위다. 주요 경로는 Modal의 `/modal/browse/latest`, `/modal/browse/growing`, `/modal/community/memories`로 전달된다.

### D. 기억 단위 댓글과 반응

| 메서드    | 경로                                                |  인증 | 역할                          |
| ------ | ------------------------------------------------- | --: | --------------------------- |
| GET    | `/api/memories/:memoryId/reactions`               |  필요 | 사용자 상태 포함 반응 summary        |
| POST   | `/api/memories/:memoryId/reactions`               |  필요 | 반응 toggle                   |
| GET    | `/api/memories/:memoryId/comments`                |  필요 | private/authenticated 댓글 목록 |
| POST   | `/api/memories/:memoryId/comments`                |  필요 | 댓글 생성                       |
| DELETE | `/api/comments/:commentId`                        |  필요 | 자신의 댓글 soft delete          |
| GET    | `/api/trees/:treeId/memories/:memoryId/reactions` | 불필요 | 공개 aggregate count          |
| GET    | `/api/trees/:treeId/memories/:memoryId/comments`  | 불필요 | 공개 안전 댓글 DTO                |

공개 기억 댓글은 `id`, `body`, `createdAt`만 반환하며 작성자의 raw UID를 반환하지 않는다. 공개 반응은 aggregate count만 반환한다.

### E. 트리 단위 상호작용

| 메서드  | 경로                                     |  인증 | 역할                            |
| ---- | -------------------------------------- | --: | ----------------------------- |
| GET  | `/api/trees/:treeId/likes`             |  필요 | 현재 사용자 상태가 포함된 트리 좋아요 summary |
| POST | `/api/trees/:treeId/likes`             |  필요 | 트리 좋아요 toggle                 |
| GET  | `/api/trees/:treeId/comments?limit=:n` | 불필요 | 공개 트리 댓글                      |
| POST | `/api/trees/:treeId/comments`          |  필요 | 트리 댓글 생성                      |
| POST | `/api/trees/:treeId/views`             | 불필요 | 공개 트리 조회 기록                   |

트리 댓글 공개 응답은 작성자 계정 ID 대신 `authorDisplayLabel: "anonymous"`를 사용한다.

### F. 보조 API

```text
GET  /api/youtube/oembed?url=<encoded-url>
POST /api/scout/suggest
POST /api/scout/save-memory
```

Scout는 LoveTree 3.0 1차 프런트엔드 연결에 필수는 아니다. 해당 화면을 구현할 때만 별도 계약 검토 후 연결한다.

## 2.4 트리 요청·응답 형식

### 생성 요청

```json
{
  "title": "나의 첫 러브트리",
  "visibility": "public",
  "groupName": null,
  "keywords": []
}
```

현재 UI는 첫 트리를 만들 때 다음 최소 payload를 보낸다.

```json
{
  "title": "사용자가 입력한 제목",
  "visibility": "public"
}
```

### 표준 응답 예시

```json
{
  "id": "uuid-formatted-string",
  "ownerId": "firebase-uid",
  "title": "나의 첫 러브트리",
  "visibility": "public",
  "memoryCount": 0,
  "groupName": null,
  "keywords": [],
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

일부 owner list 응답에는 DB schema와 기능 가용성에 따라 `likeCount`, `viewCount`가 포함될 수 있다.

## 2.5 기억 요청·응답 형식

### 생성 요청 예시

```json
{
  "treeId": "uuid-formatted-string",
  "parentId": null,
  "title": "첫 번째 순간",
  "memo": "이 순간을 좋아하게 된 이유",
  "artist": "",
  "source": "YouTube",
  "sourceUrl": "https://www.youtube.com/embed/...",
  "sourceType": "youtube",
  "thumbnail": "https://img.youtube.com/vi/.../mqdefault.jpg",
  "emotionTags": ["감동", "설렘"],
  "timestamp": "2026.07.20",
  "visibility": "public",
  "channelId": null,
  "channelName": null,
  "channelUrl": null
}
```

현재 에디터는 link 모드 또는 text 모드로 payload를 만들고, 새 기억의 기본 공개 범위를 `public`으로 보낸다. YouTube thumbnail도 파일이 아니라 URL 문자열로 저장한다.

### 표준 기억 응답

```json
{
  "id": "uuid-formatted-string",
  "treeId": "uuid-formatted-string",
  "parentId": null,
  "title": "",
  "memo": "",
  "artist": "",
  "source": "",
  "sourceUrl": "",
  "sourceType": "youtube",
  "thumbnail": "",
  "emotionTags": [],
  "timestamp": "",
  "visibility": "public",
  "channelId": null,
  "channelName": null,
  "channelUrl": null,
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

실제 Modal normalizer도 이 flat camelCase 형식을 생성한다.

## 2.6 인증 토큰 전달

브라우저 API client는 Firebase 로그인 사용자의 ID Token을 얻어 다음 헤더로 보낸다.

```http
Authorization: Bearer <Firebase ID Token>
```

현재 `base-api-fetch.js`의 핵심 동작:

* Firebase `currentUser`에서 `getIdTokenResult()` 또는 `getIdToken()` 호출
* token 만료 30초 전부터 cache를 무효 처리
* token cache는 `sessionStorage` 사용
* 과거 localStorage token은 삭제
* public read 요청에서는 Authorization을 제거
* 인증된 요청에서 401/403이 발생하면 제한적으로 auth bootstrap을 기다린 뒤 재시도
* 지속적인 인증 실패 시 확인된 로그인 상태와 private cache를 정리

토큰 자체는 로그, 오류 메시지, screenshot, PR, Issue, 저장소에 남기면 안 된다.

## 2.7 오류 응답 형식

현재 오류 계약은 하나의 완전히 통일된 envelope가 아니다. LoveTree 3.0 클라이언트는 최소한 다음 형식을 모두 수용해야 한다.

### Cloudflare gateway 오류

```json
{
  "error": "Authorization required"
}
```

```json
{
  "error": "Payload too large"
}
```

```json
{
  "error": "Modal service temporarily unavailable"
}
```

### FastAPI 기본 오류

```json
{
  "detail": "Authentication required"
}
```

또는:

```json
{
  "detail": {
    "code": "EMPTY_MEMORY_UPDATE"
  }
}
```

### custom social 오류

```json
{
  "error": "오류 설명",
  "code": "IDEMPOTENCY_KEY_REQUIRED",
  "retryAfterMs": 1000
}
```

### Plus private storage 오류

```json
{
  "error": "Private storage requires Plus.",
  "code": "PLUS_REQUIRED_PRIVATE_STORAGE",
  "upgradeRequired": true
}
```

권고 error normalizer:

```javascript
function normalizeApiError(status, data) {
  const detail = data?.detail;

  return {
    status,
    code:
      data?.code ||
      (detail && typeof detail === "object" ? detail.code : null) ||
      null,
    message:
      data?.error ||
      (typeof detail === "string" ? detail : null) ||
      "Request failed",
    data
  };
}
```

### 주요 HTTP 상태

|  상태 | 의미                                     |
| --: | -------------------------------------- |
| 400 | 검증 실패, 잘못된 field, Idempotency-Key 누락   |
| 401 | 로그인 토큰 없음 또는 유효하지 않음                   |
| 403 | 소유권 없음, 비공개 접근 거부, Plus 필요             |
| 404 | 존재하지 않음 또는 private resource를 공개 요청한 경우 |
| 409 | 저장 acknowledgement 불일치, 중복·충돌          |
| 410 | idempotency 결과가 삭제되어 재현 불가             |
| 413 | body 128KB 초과                          |
| 429 | rate limit                             |
| 500 | 백엔드 또는 schema 오류                       |
| 503 | Modal 미설정 또는 일시 접근 불가                  |
| 504 | Modal upstream timeout                 |

## 2.8 Idempotency-Key

다음 write는 `Idempotency-Key`를 요구한다.

* 기억 reaction toggle
* 기억 comment 생성
* 트리 like toggle
* 트리 comment 생성

형식:

```text
8~128자
허용 문자: A-Z a-z 0-9 . _ : -
```

기존 클라이언트는 브라우저 crypto API로 키를 생성한다. 새 프런트도 같은 논리 또는 UUID 기반 키를 사용해야 한다.

## 2.9 페이지네이션

현재 핵심 API는 cursor 기반 페이지네이션이 완성된 상태가 아니다.

| 경로              | 현재 방식                            |
| --------------- | -------------------------------- |
| `/api/trees`    | `limit`, 기본 100, 최대 200          |
| `/api/memories` | `limit`, 기본 100, 최대 200          |
| Browse summary  | `limit`, 최대 60                   |
| Growing trees   | `limit`, 3~12                    |
| private 기억 댓글   | `limit`, 최대 200                  |
| public 기억 댓글    | 기본 20, 최대 50, `nextCursor: null` |
| 트리 댓글           | 기본 20, 최대 50                     |

LoveTree 3.0은 `nextCursor`가 실제 값을 반환한다고 가정하면 안 된다. 1차 구현은 bounded list로 연결하고, 대규모 데이터에 대한 진짜 cursor pagination은 별도 API 변경으로 다룬다.

## 2.10 파일 업로드 방식

현재 핵심 런타임에서는 다음을 확인하지 못했다.

* multipart upload API
* Firebase Storage browser SDK
* 이미지 blob 저장 API
* 별도 `images` 테이블
* presigned upload URL
* base64 image 저장 계약

현재 이미지 관련 필드는 다음 URL metadata다.

* `Memory.thumbnail`
* Browse의 `representativeThumbnail`
* 일부 레거시 문서상 `coverImage`
* YouTube에서 계산한 thumbnail URL

따라서 LoveTree 3.0에서 “이미지 업로드” UI가 필요하다면 기존 API가 제공한다고 가정하면 안 된다. 별도 object storage, 업로드 API, 크기·형식 검사, 삭제 정책을 먼저 설계해야 한다.

현재 gateway body 상한이 128KB이므로 이미지를 base64 JSON으로 넣는 구현도 금지해야 한다.

## 2.11 CORS와 쿠키

현재 계약은 cookie session이 아니라 Bearer token 방식이다.

* 브라우저는 same-origin `/api/*` 사용
* Cloudflare gateway에 cookie 기반 인증 계약 없음
* Modal CORS는 `allow_credentials=False`
* 브라우저가 Modal을 직접 호출하는 구조가 아님
* 기존 LoveBud Pages API가 새 도메인에 CORS를 제공한다고 가정하면 안 됨
* 새 도메인에서 로그인하려면 Firebase Authorized Domains 등록 필요

Modal의 현재 CORS 코드 기본값에는 과거 Netlify 주소가 남아 있지만, 운영 문서는 이를 stale origin으로 규정한다. 이 부분은 코드와 문서가 불일치한다.

---

# 3. 핵심 데이터 모델

## 3.1 사용자

### 논리 모델

```typescript
interface UserIdentity {
  uid: string;       // Firebase uid/sub
  email?: string;    // optional metadata
}
```

* 인증의 canonical 사용자 ID는 Firebase `uid` 또는 token의 `sub`
* Neon `users.id`에도 같은 UID를 저장
* 이메일은 선택적 metadata
* 이메일을 owner ID 대신 사용하면 안 됨
* 새 트리 생성 시 필요하면 Neon `users` 행을 upsert
* private storage entitlement의 실질 판정은 현재 Firestore user profile에서 수행

`ensure_owner_user_exists()`는 Firebase UID를 `users.id`에 저장하고 선택적으로 email과 timestamps를 갱신한다.

### Plus/private storage 판정

현재 compatibility 판정 순서:

1. `privateStorageEnabled`
2. `plan`이 `plus` 또는 `admin`
3. `plus`
4. `entitlements.privateStorage`

장기 canonical field는 `privateStorageEnabled`로 문서화돼 있으나 compatibility field의 장기 존치 여부는 확정되지 않았다.

## 3.2 트리

### canonical 논리 모델

```typescript
interface Tree {
  id: string;
  ownerId: string | null;
  title: string;
  visibility: "public" | "private";
  memoryCount: number;
  groupName?: string | null;
  keywords?: string[];
  likeCount?: number;
  viewCount?: number;
  forkedFromTreeId?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
```

### 주요 DB 의미

```text
trees.id
trees.owner_id
trees.title
trees.visibility
trees.group_name
trees.keywords
trees.forked_from_tree_id
trees.created_at
trees.updated_at
```

주의: 과거 운영 DB schema drift 때문에 `trees.id`의 물리 타입은 문서·migration 간 차이가 있다. 프런트에서는 UUID 형식 문자열로 취급하되, DB migration을 새 프런트 저장소에서 실행해서는 안 된다.

## 3.3 기억 또는 순간

```typescript
interface Memory {
  id: string;
  treeId: string;
  parentId: string | null;
  title: string;
  memo: string;
  artist: string;
  source: string;
  sourceUrl: string;
  sourceType: string;
  thumbnail: string;
  emotionTags: string[];
  timestamp: string;
  visibility: "public" | "private";
  channelId: string | null;
  channelName: string | null;
  channelUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
```

주요 제약:

* 반드시 소유자가 가진 트리에 생성
* `parentId`는 같은 트리의 기억만 가능
* 자기 자신을 parent로 설정할 수 없음
* descendant를 parent로 설정해 cycle을 만들 수 없음
* emotionTags 최대 20개
* title 최대 200자
* memo 최대 5,000자
* source URL 최대 1,000자
* thumbnail URL 최대 500자
* 기본 sourceType은 `youtube`
* visibility 생략 시 트리 공개 범위를 따름
* private은 Plus guard 적용

기억 생성과 수정은 explicit allowlist를 사용한다.

## 3.4 트리 관계

현재 트리 구조는 별도의 edge table보다 `memories.parent_id`를 이용한 계층 관계다.

```text
Tree
 ├─ Memory A (parentId = null)
 │   ├─ Memory B (parentId = A)
 │   └─ Memory C (parentId = A)
 └─ Memory D (parentId = null 또는 다른 노드)
```

LoveTree 3.0 화면에서 연결선이나 노드 배치를 새로 구현하더라도 저장 계약은 `parentId`를 유지해야 한다.

별도 UI layout 저장 기능은 appreciation order, hub layout 등 추가 API에 분리돼 있으므로 1차 프런트 연결에서 무리하게 합치지 않는다.

## 3.5 이미지

현재 별도 이미지 entity는 없다.

```typescript
interface ImageReference {
  url: string;
  role: "thumbnail" | "representative-thumbnail" | "external-media";
}
```

현재 이미지는 DB에 binary가 아니라 URL 문자열로 저장되는 것으로 봐야 한다.

* 기억 썸네일: `memories.thumbnail`
* 대표 이미지: 공개 summary가 기억의 thumbnail 또는 source URL에서 계산
* YouTube 썸네일: YouTube URL에서 유도

## 3.6 댓글

### 기억 댓글

```typescript
interface MemoryCommentPrivate {
  id: string;
  memoryId: string;
  ownerId: string;
  body: string;
  createdAt: string | null;
  updatedAt: string | null;
}
```

공개 DTO:

```typescript
interface MemoryCommentPublic {
  id: string;
  body: string;
  createdAt: string | null;
}
```

### 트리 댓글

```typescript
interface TreeCommentPublic {
  id: string;
  treeId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  authorDisplayLabel: "anonymous";
}
```

기억 댓글과 트리 댓글은 서로 다른 테이블·도메인이다. 하나로 합치거나 `memoryId`와 `treeId`를 임의로 혼용하면 안 된다.

## 3.7 반응·좋아요·조회

현재 상호작용은 최소 다음으로 분리돼 있다.

* 기억 반응: `reactions`, memory target
* 트리 좋아요: tree target
* 트리 조회: tree target
* 기억 댓글: `comments`, memory target
* 트리 댓글: `tree_comments`, tree target

기억 reaction은 사용자·기억·type 조합에 unique toggle semantics가 적용된다. 기존 migration은 memory와 social row의 `ON DELETE CASCADE`를 정의한다.

## 3.8 공개·비공개 범위

현재 정책은 **public-first + Plus private**다.

* 신규 트리 기본값: `public`
* 신규 기억 기본값: 트리 visibility 또는 현재 UI의 명시적 `public`
* `private` 생성·전환: Plus entitlement 필요
* 공개 트리라도 Browse에 자동 노출되는 것은 아님
* Browse 기본 조건:

  * 트리가 public
  * public 기억 최소 3개
  * summary filter 통과

공개 상태와 Browse 노출 여부는 분리된 개념이다.

## 3.9 관계 및 권한

| 주체       | 허용                                              |
| -------- | ----------------------------------------------- |
| 익명 사용자   | 공개 트리·공개 기억 조회, 공개 aggregate/social read, 조회 기록 |
| 로그인 사용자  | 공개 트리 감상, 공개 대상 댓글·반응·좋아요, 공개 트리 복사             |
| 트리 소유자   | 자신의 트리·기억 생성·수정·삭제, 공개 범위 변경, 댓글 moderation     |
| Plus 사용자 | private 트리·private 기억 생성 또는 전환                  |
| 비소유자     | 다른 사용자의 트리·기억 수정·삭제 금지                          |

현재 공동 편집자, 관리자 공유 편집, tree membership role 모델은 확인되지 않았다. LoveTree 3.0이 협업 편집을 추가하려면 기존 권한 모델을 확장하는 백엔드 변경이 필요하다.

## 3.10 삭제와 복구

### 트리 삭제

* owner 확인
* 하위 기억의 parent 관계 해제
* 하위 기억 삭제
* 트리 삭제
* 응답: `{deleted:true, id}`

현재 코드상 하드 삭제다. recycle bin 또는 restore API는 없다.

### 기억 삭제

* owner 확인
* 해당 기억을 parent로 가리키는 자식 기억의 `parent_id`를 `NULL`로 변경
* 기억 row 삭제
* 응답: `{deleted:true, id, treeId}`

하드 삭제이며 복구 API가 없다.

### 댓글 삭제

기억 댓글은 soft delete다.

```text
status = deleted
deleted_at = NOW()
deleted_by = actor_id
```

트리 소유자 moderation은 `hidden` 상태를 사용한다.

---

# 4. LoveTree 3.0에서 재사용해야 할 코드

## 4.1 재사용 분류 기준

* **그대로 복사 가능:** 프런트 구조와 무관하고 안정된 작은 gateway helper
* **수정해서 가져오기:** 핵심 계약은 유효하지만 기존 전역 스크립트 구조에 묶여 있음
* **API 계약만 참고:** 기존 저장소에서 계속 운영해야 할 백엔드·DB 코드
* **가져오지 않음:** 구 UI, 레거시 배포, 불필요한 호환 계층

## 4.2 코드별 판단

| 정확한 경로                                                            | 역할                                              | LoveTree 3.0 처리                      |
| ----------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------ |
| `functions/api/trees.js`                                          | 트리 목록·생성 프록시                                    | 수정해서 가져오기                            |
| `functions/api/trees/[id].js`                                     | 트리 상세·수정·삭제, 공개 cache                           | 수정해서 가져오기                            |
| `functions/api/memories.js`                                       | 기억 목록·생성 진입점                                    | 수정해서 가져오기                            |
| `functions/api/memories/[id].js`                                  | 기억 상세·수정·삭제                                     | 수정해서 가져오기                            |
| `functions/_shared/memory-route-proxy.js`                         | 기억 collection/detail 공통 프록시                     | 비교적 그대로 재사용 가능                       |
| `functions/api/[[path]].js`                                       | Browse, community, fork, capability 등 catch-all | 전체 복사보다 필요한 route만 추출                |
| `functions/api/memories/[id]/reactions.js`                        | 기억 reaction 프록시                                 | 해당 기능 구현 시 수정해서 가져오기                 |
| `functions/api/memories/[id]/comments.js`                         | 기억 comment 프록시                                  | 해당 기능 구현 시 수정해서 가져오기                 |
| `functions/api/trees/[tree_id]/likes.js`                          | 트리 좋아요                                          | 해당 기능 구현 시 수정해서 가져오기                 |
| `functions/api/trees/[tree_id]/comments.js`                       | 트리 댓글                                           | 해당 기능 구현 시 수정해서 가져오기                 |
| `functions/api/trees/[tree_id]/views.js`                          | 트리 조회수                                          | 해당 기능 구현 시 수정해서 가져오기                 |
| `functions/api/trees/[tree_id]/memories/[memory_id]/reactions.js` | guest-safe reaction read                        | 해당 기능 구현 시 가져오기                      |
| `functions/api/trees/[tree_id]/memories/[memory_id]/comments.js`  | guest-safe comment read                         | 해당 기능 구현 시 가져오기                      |
| `functions/api/comments/[id].js`                                  | 댓글 soft delete                                  | 해당 기능 구현 시 가져오기                      |
| `js/api/base-api-fetch.js`                                        | token 준비, `/api` 호출, 오류 lifecycle               | 프레임워크 독립 API client로 재작성             |
| `js/postgres-client.js`                                           | 프런트 API facade                                  | method 목록과 endpoint 계약만 참고           |
| `js/auth/auth-*.js`                                               | Firebase auth lifecycle                         | 구조를 참고해 새 상태 관리에 맞게 재작성              |
| `js/auth.js`                                                      | 전체 auth bootstrap·logout                        | 그대로 복사 금지, 동작만 이전                    |
| `js/firebase-config.js`                                           | Firebase client 초기화                             | 값 복사 금지, 초기화 패턴만 참고                  |
| `js/api/public-tree-adapter.js`                                   | snake_case·legacy envelope 호환                   | 기본적으로 가져오지 않음. 실데이터 호환 필요 시 제한적으로 사용 |
| `js/editor/editor-memory-form-payload.js`                         | 기억 생성 payload와 YouTube metadata 생성              | request builder 논리 참고                |
| `js/my-trees/my-trees-actions.js`                                 | 트리 생성·수정·삭제 UX                                  | 사용자 흐름과 오류 처리만 참고                    |
| `modal_compute/app.py`                                            | FastAPI route 정의                                | 복사하지 않고 API 계약 원천으로 참조               |
| `modal_compute/auth.py`                                           | token 및 Plus 검증                                 | 복사하지 않고 기존 Modal 재사용                 |
| `modal_compute/tree_writes.py`                                    | 트리 domain write                                 | 기존 백엔드에서만 유지                         |
| `modal_compute/memory_writes.py`                                  | 기억 domain write                                 | 기존 백엔드에서만 유지                         |
| `modal_compute/public_reads.py`                                   | 공개 데이터와 legacy 정규화                              | 기존 백엔드에서만 유지                         |
| `modal_compute/comments.py`                                       | 기억 댓글 domain                                    | 기존 백엔드에서만 유지                         |
| `modal_compute/tree_comments.py`                                  | 트리 댓글 domain                                    | 기존 백엔드에서만 유지                         |
| `modal_compute/reactions.py`                                      | 기억 반응 domain                                    | 기존 백엔드에서만 유지                         |
| `modal_compute/db.py`                                             | Neon pool                                       | 절대 프런트 저장소로 복사하지 않음                  |
| `_redirects`                                                      | Pages 정적 route canonicalization                 | LoveTree 3.0 라우트에 맞게 새로 작성           |
| `tests/contracts/*`                                               | API·보안·DOM 계약                                   | 핵심 API 계약만 선별 이전                     |

## 4.3 가장 가치가 높은 재사용 대상

### 1순위: API 계약

새 프런트에서 endpoint와 DTO를 typed client로 고정한다.

```typescript
interface LoveTreeApi {
  listTrees(): Promise<Tree[]>;
  createTree(input: CreateTreeInput): Promise<Tree>;
  getTree(id: string): Promise<Tree>;
  updateTree(id: string, input: UpdateTreeInput): Promise<Tree>;
  deleteTree(id: string): Promise<DeleteTreeResult>;

  listMemories(treeId: string): Promise<Memory[]>;
  createMemory(input: CreateMemoryInput): Promise<Memory>;
  updateMemory(id: string, input: UpdateMemoryInput): Promise<Memory>;
  deleteMemory(id: string): Promise<DeleteMemoryResult>;
}
```

### 2순위: 인증 헤더·재시도 로직

기존 `base-api-fetch.js`의 다음 동작을 보존한다.

* same-origin `/api`
* Firebase ID Token
* `Bearer`
* public read에서는 token 제거
* token expiry margin
* bootstrap pending을 signed-out으로 오판하지 않음
* 401/403 후 private cache 정리
* 응답의 `error`, `detail`, `code` 보존

### 3순위: Pages Function 보안 경계

* route allowlist
* body 128KB
* timeout 25초
* Authorization 전달
* Idempotency-Key 형식 검사
* request ID
* 503/504 degraded response

---

# 5. 가져오면 안 되는 코드와 레거시

## 5.1 기존 프런트엔드 UI 전체

다음은 새 화면 이미지 기준 재구현 목표와 충돌하므로 통째로 복사하지 않는다.

```text
index.html
pages/*.html
css/**
js/index.js
js/search/**
js/detail/**
js/editor.js
js/editor/**
js/my-trees.js
js/my-trees/**
js/viewer/**
js/shared-header.js
js/page-shell.js
```

예외는 API payload builder처럼 UI와 분리 가능한 순수 로직이다.

## 5.2 전역 window 네임스페이스 구조

기존 구조:

```javascript
window.apiClient
window.LoveTreeBaseApiFetch
window.LoveTreePublicTreeAdapter
window.LoveBudEditorMemoryFormPayload
window.__lovebudAuthReady
```

이는 번들러 없는 현재 LoveBud를 유지하기 위한 구조다. LoveTree 3.0이 React, Vue, Svelte, TypeScript 또는 모듈 기반 vanilla JS를 사용한다면 ES module·typed service·state store로 바꿔야 한다.

## 5.3 Vercel 설정

```text
vercel.json
```

* 현재 active production 설정이 아님
* rewrite가 Cloudflare route와 중복
* 새 저장소 배포가 Cloudflare Pages라면 불필요
* 자동 삭제 대상은 아니지만 LoveTree 3.0에 가져올 이유도 없음

## 5.4 Netlify 레거시

```text
netlify/
netlify.toml
netlify/functions/**
NETLIFY_DATABASE_URL
POSTGRES_URL 기반 legacy function
```

현재 active runtime에 사용하지 않는다. Netlify backend를 복구하거나 route parity를 구현하면 안 된다.

## 5.5 오래된 문서

특히 다음은 현재 코드보다 우선하면 안 된다.

* `docs/ops/ENV_DEPENDENCY.md`

  * 현재 없는 `netlify/functions/*`와 일부 과거 fallback 설명이 남아 있음
* `docs/ops/RUNTIME_ROUTING_TRUTH_DRAFT_20260425.md`

  * draft
* `docs/conversation/full/**`

  * 당시 대화 복원용
* 과거 Netlify·Vercel migration 계획
* 구현 완료 전의 product plan·audit
* API 계약의 legacy `Tree.payload.nodes` 설명

`API_CONTRACT.md`는 canonical naming에는 유효하지만, Tree의 `payload`, `nodeCount` 등 일부 shape는 현재 `normalize_tree_row()`의 실제 응답과 차이가 있다. 새 클라이언트는 실제 Modal 응답을 기준으로 계약 테스트를 고정해야 한다.

## 5.6 과거 migration

다음 SQL은 LoveTree 3.0 프런트 저장소에서 실행하면 안 된다.

```text
scripts/migration-add-reactions-comments.sql
scripts/migration-add-tree-comments.sql
scripts/migration-add-tree-social-counts.sql
scripts/migration-add-tree-view-tracking.sql
scripts/migration-add-generic-social-targets.sql
scripts/migration-b-generic-social-targets-cutover.sql
scripts/migration-repair-trees-schema-3435.sql
scripts/rollback-*.sql
```

이들은 운영 DB의 현재 적용 여부와 provenance를 확인한 뒤 기존 LoveBud 저장소에서만 별도 승인해 다룬다.

## 5.7 과거 목업·테스트 모드·stub

* demo mode fallback tree
* `testPublic=1`
* `lovebud_test_public`
* local AI stub
* prototype/reference/demo/variant 화면
* 정적 mock tree·memory data
* production 동작을 대체하는 localStorage 저장

LoveTree 3.0 production 경로에 포함하지 않는다.

## 5.8 중복 또는 위험한 설정

* Firebase Web config 값을 여러 파일에 중복 보관
* `DATABASE_URL`을 새 프런트 저장소에 추가
* `FIREBASE_SERVICE_ACCOUNT_JSON`을 Pages 또는 브라우저 환경에 노출
* Modal 주소를 브라우저 bundle에 직접 노출하고 직접 호출
* LoveBud API와 Modal API를 동시에 사용하는 dual path
* Vercel·Netlify fallback 자동 전환
* cookie와 bearer token을 혼용
* API 오류를 무조건 200으로 변환
* private 데이터를 localStorage에 영구 cache

---

# 6. 인증 통합

## 6.1 Firebase 초기화 위치

기존 초기화 원천:

```text
js/firebase-config.js
```

현재 계약:

```javascript
window.FIREBASE_CONFIG
window.__lovebudFirebaseInitialized
window.initFirebase()
```

LoveTree 3.0에서는 이를 다음과 같이 모듈화한다.

```typescript
// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
```

같은 Firebase 프로젝트를 사용해야 기존 Modal이 발급된 ID Token을 검증할 수 있다.

## 6.2 로그인 상태 확인

기존 계약의 핵심은 “Firebase 초기화가 끝나기 전의 pending 상태를 signed-out으로 오판하지 않는 것”이다.

권고 상태:

```typescript
type AuthState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "error"; error: Error };
```

protected route는 `loading` 중 리다이렉트하면 안 된다.

```typescript
if (authState.status === "loading") {
  return <LoadingScreen />;
}

if (authState.status === "anonymous") {
  redirectToLogin();
}
```

## 6.3 로그인

현재 주요 진입은 Google 로그인이다.

권고 흐름:

1. Firebase client 초기화
2. `onAuthStateChanged` listener 등록
3. Google popup 또는 redirect 시작
4. Firebase user 확인
5. 원래 요청한 경로 복원
6. 첫 API 요청 시 ID Token 획득
7. `/api/trees` 호출

로그인 페이지 자체가 DB user row를 직접 생성할 필요는 없다. 첫 트리 생성 등 owner write 시 Modal이 `users` row를 보장한다.

## 6.4 토큰 갱신

별도 LoveBud refresh-token endpoint는 없다.

* Firebase SDK가 session과 token을 관리
* API 요청 전에 `getIdTokenResult()` 또는 `getIdToken()` 사용
* 만료 직전 token cache 무효화
* 필요한 경우 Firebase SDK가 갱신
* API가 401을 반환했다고 무한 재시도하지 않음
* 1회의 제한된 bootstrap/token 재확인 후 실패 처리

권고:

```typescript
async function getAuthorizationHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};

  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`
  };
}
```

token 문자열을 Redux devtools, logger, analytics, Sentry breadcrumb에 남기지 않는다.

## 6.5 로그아웃

현재 로그아웃 논리:

1. Firebase `signOut`
2. token cache 삭제
3. confirmed auth state 삭제
4. private tree·memory cache 삭제
5. UI 상태 초기화
6. 로그인 또는 홈으로 이동

LoveTree 3.0에서도 private query cache를 반드시 비워야 한다.

```typescript
await signOut(auth);
queryClient.clear();
sessionStorage.removeItem("lovetree3_auth_token");
navigate("/");
```

## 6.6 인증 실패 처리

| 상황                | 처리                            |
| ----------------- | ----------------------------- |
| Firebase 초기화 실패   | 로그인 기능 비활성화 및 명시적 오류          |
| auth loading      | 기다림, 로그인 페이지로 즉시 이동하지 않음      |
| 401               | token 재확인 1회 후 로그인 상태 초기화     |
| 403 owner denial  | 로그인 페이지가 아니라 권한 없음 화면         |
| 403 Plus required | upgrade UI 또는 public 전환 안내    |
| popup 취소          | 사용자 취소로 처리, 오류 toast 과장 금지    |
| network offline   | cached public UI와 인증 불가 상태 구분 |
| invalid token     | session 제거 후 재로그인             |

## 6.7 개발 환경에서 필요한 설정 이름

### 기존 LoveBud 런타임의 실제 이름

Cloudflare Pages:

```text
MODAL_BASE_URL
```

Modal:

```text
DATABASE_URL
FIREBASE_SERVICE_ACCOUNT_JSON
FIREBASE_PROJECT_ID
CORS_ALLOWED_ORIGINS
```

`LOVEBUD_UPSTREAM_ORIGIN`은 문서에 남아 있으나 현재 주요 Function 코드의 활성 의존으로 확인되지 않았다. LoveTree 3.0의 필수 변수로 넣지 않는다.

### LoveTree 3.0 권고 이름

새 프런트가 Vite 계열인 경우:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

초기 reverse proxy 방식:

```text
LOVEBUD_API_ORIGIN
```

값의 의미:

```text
기존 LoveBud 공식 API origin
예: https://lovebud.pages.dev
```

직접 Modal proxy로 전환할 때만:

```text
MODAL_BASE_URL
```

프레임워크가 Vite가 아니라면 `VITE_` 접두사는 해당 프레임워크의 public env 규칙으로 바꾼다.

## 6.8 절대 커밋하면 안 되는 값

* `DATABASE_URL`
* 실제 Neon 사용자명·비밀번호·host
* `FIREBASE_SERVICE_ACCOUNT_JSON`
* Firebase Admin private key
* Google OAuth client secret
* 실제 ID Token
* refresh token
* cookie 또는 session dump
* 테스트 계정 비밀번호
* Cloudflare API token
* Modal token
* production `.env`
* 실제 사용자 이메일·UID가 포함된 fixture
* 운영 screenshot에 노출된 개인 계정 정보

Firebase Web client config는 브라우저 공개 설정이므로 비밀키와 동일하지는 않지만, 프로젝트별 설정 관리와 Authorized Domains 검증은 필요하다.

---

# 7. 기존 핵심 사용자 흐름

## 7.1 로그인

```text
홈 또는 보호 페이지
→ 로그인 페이지
→ Firebase Google 로그인
→ auth bootstrap 완료
→ redirect 파라미터 복원
→ My Trees 또는 원래 경로 이동
→ ID Token으로 /api 요청
```

첫 화면부터 API를 호출하는 경우 auth가 아직 pending인지 먼저 구분한다.

## 7.2 첫 트리 생성

```text
My Trees
→ 새 러브트리
→ 제목 입력
→ POST /api/trees
  {
    title,
    visibility: "public"
  }
→ 생성 응답의 tree.id 확인
→ /editor?treeId=<id> 이동
```

현재 UI는 생성 전에 기존 tree ID snapshot을 확보하고, 네트워크가 애매하게 실패하면 재조회로 중복 생성 여부를 확인한다. 새 프런트에서도 create timeout 후 즉시 재시도해 중복 트리를 만들지 않도록 reconciliation 또는 idempotency 개선이 필요하다.

## 7.3 첫 기억 저장

```text
Editor
→ 링크 또는 텍스트 모드 선택
→ 제목·메모·태그 입력
→ YouTube URL이면 embed URL과 thumbnail 계산
→ parentId 결정
→ POST /api/memories
→ 저장 응답으로 화면 상태 갱신
```

링크 모드:

* URL 필수
* YouTube ID 검증
* 시작·종료 구간 처리
* embed URL 저장
* thumbnail URL 저장
* sourceType `youtube`

텍스트 모드:

* 제목 또는 메모 중 하나 이상 필요
* sourceType `other`
* sourceUrl과 thumbnail은 빈 문자열 가능

## 7.4 기억 조회

소유자 편집 화면:

```text
GET /api/trees/:treeId
GET /api/memories?treeId=:treeId
```

공개 상세:

```text
GET /api/trees/:treeId
GET /api/community/memories?treeId=:treeId
```

공개 UI에서는 tree와 memory 모두 public인지 확인된 결과만 표시한다.

## 7.5 기억 수정

```http
PUT /api/memories/:memoryId
Authorization: Bearer ...
Content-Type: application/json
```

허용 field:

```text
title
memo
artist
source
sourceUrl
sourceType
thumbnail
emotionTags
timestamp
visibility
channelId
channelName
channelUrl
parentId
```

빈 payload와 지원되지 않는 field는 400이다.

## 7.6 기억 삭제

```text
사용자 확인
→ DELETE /api/memories/:memoryId
→ 성공 응답 확인
→ 화면·query cache에서 삭제
→ 삭제된 기억의 자식은 root 또는 연결 해제 상태로 다시 표시
```

삭제 후 복구 기능은 없다. UI에서 이 사실을 명확히 표시해야 한다.

## 7.7 공개 설정

트리:

```http
PUT /api/trees/:treeId

{
  "visibility": "public"
}
```

또는:

```json
{
  "visibility": "private"
}
```

기억도 같은 방식으로 visibility를 수정할 수 있다.

주의:

* private 요청은 Plus guard
* 트리만 public이고 기억이 private이면 해당 기억은 공개 상세에 나오지 않음
* 기억만 public이어도 부모 트리가 private이면 공개 read 불가
* public과 Browse 노출은 별개

## 7.8 공개 상세 페이지

```text
Browse
→ 공개 Tree 선택
→ /detail 또는 public viewer
→ GET /api/trees/:treeId
→ GET /api/community/memories?treeId=:treeId
→ 필요 시 공개 댓글·반응 요청
→ POST /api/trees/:treeId/views
```

공개 상세에서 private 여부를 노출하는 정보 차이를 만들지 않도록 private/missing/mismatch는 404로 처리되는 경로가 있다.

## 7.9 이미지 업로드

현재 제공되는 흐름은 업로드가 아니라 URL metadata 저장이다.

```text
YouTube URL
→ video ID 추출
→ embed URL 계산
→ thumbnail URL 계산
→ JSON으로 memory 저장
```

LoveTree 3.0에 로컬 이미지 업로드 버튼을 구현할 경우 기존 백엔드 재사용 범위를 벗어난다. 업로드 API가 준비되기 전에는 UI를 노출하지 않거나 “이미지 URL 연결” 수준으로 한정한다.

## 7.10 댓글과 상호작용

기억 댓글:

```text
로그인
→ Idempotency-Key 생성
→ POST /api/memories/:memoryId/comments
  { "body": "..." }
→ comment 응답 추가
```

기억 반응:

```text
로그인
→ Idempotency-Key 생성
→ POST /api/memories/:memoryId/reactions
  { "type": "like" }
```

트리 댓글과 좋아요도 동일하게 인증과 Idempotency-Key를 사용한다.

공개 페이지의 댓글 read와 write는 계약이 다르다.

* read: 공개-safe DTO
* write: 로그인 필요
* 삭제: 댓글 작성자만 가능
* moderation: 트리 소유자만 가능

---

# 8. 테스트와 검증

## 8.1 설치

```bash
npm ci
```

CI 기준 Node 버전은 20이다. CI는 Playwright Chromium도 설치한다.

## 8.2 로컬 정적 실행

현재 `package.json`에는 canonical `dev` 명령이 없다.

정적 화면만 확인할 때:

Windows:

```bash
py -m http.server 4173
```

WSL/Linux/macOS:

```bash
python3 -m http.server 4173
```

이 방식은 다음만 검증한다.

* HTML/CSS/JS 로드
* 정적 route
* 기본 반응형 화면
* 일부 public 외부 resource

다음은 검증하지 못한다.

* Cloudflare Pages Functions
* same-origin `/api`
* Modal
* Firebase Authorized Domain
* owner write
* Neon persistence

## 8.3 빌드 명령

```bash
npm run build
```

현재 build는 bundle을 생성하지 않고 필수 정적 파일 존재 여부를 검사한다.

```text
Static build check passed.
No bundle step configured; deploy remains static HTML/JS.
```

## 8.4 핵심 정적·계약 테스트

```bash
npm run lint
npm run build
npm test
npm run verify
```

통합:

```bash
npm run ci
```

현재 `npm test` 범위:

```text
tests/smoke/*.test.cjs
tests/routes/*.test.cjs
tests/contracts/*.test.cjs
```

현재 package script 전체는 정적·route·contract 검증을 중심으로 구성돼 있다.

## 8.5 DB engine 테스트

```bash
npm run test:db-engine:tree-comments
npm run test:db-engine:trees-schema
npm run test:db-engine:generic-social-a-guard
npm run test:db-engine:generic-social-a
npm run test:db-engine:generic-social-b-guard
npm run test:db-engine:generic-social-b
```

요구 조건:

* PostgreSQL 17.4
* 별도의 disposable test database
* `LB_TEST_PGHOST`
* `LB_TEST_PGPORT`
* `LB_TEST_PGUSER`
* `LB_TEST_PGPASSWORD`
* `LB_TEST_PGADMIN_DB`

운영 Neon에 직접 실행하면 안 된다.

## 8.6 E2E 명령

```bash
npm run test:e2e:search-detail
npm run test:e2e:auth-guard
npm run test:e2e:editor-save
npm run test:e2e:editor-delete
npm run test:e2e:login-success
npm run test:e2e:login-timeout
npm run test:e2e:ui-regression
npm run test:e2e:public-viewer-mobile
npm run test:e2e:ci
```

추가 smoke:

```bash
npm run smoke:cloudflare
npm run smoke:gate-a
npm run check:auth-credentials
```

## 8.7 운영 연결 없이 가능한 테스트

다음은 원칙적으로 실제 운영 연결 없이 수행 가능하다.

* lint
* static build check
* Node smoke tests
* route mapping contract
* DOM/XSS contract
* API client unit contract
* Firebase 초기화 순서 contract
* payload builder contract
* error normalizer test
* mock fetch 기반 API client test
* disposable PostgreSQL 기반 DB migration engine test

## 8.8 실제 환경이 필요한 테스트

* Google 로그인 성공
* Firebase Authorized Domains
* ID Token 발급과 Modal 검증
* owner tree 목록
* 트리 생성·수정·삭제
* 기억 생성·수정·삭제
* private Plus guard
* 공개 상세의 실제 데이터
* Browse summary provenance
* 댓글·반응 rate limit
* Cloudflare request header 전달
* Modal 장애 시 503/504
* Neon 실제 schema와 코드 일치 여부

## 8.9 E2E 정책상 제약

기존 문서는 E2E를 현재 필수 gate가 아닌 optional/runtime-sensitive 검증으로 분류한다.

* auth·editor save/delete는 test account 필요

* state-changing test는 독립 test data와 cleanup 필요

* production URL은 unmerged branch의 pre-merge 증거가 아님

* Cloudflare preview 또는 고정 test slot 필요

* token, cookie, credential을 보고서에 출력하면 안 됨

## 8.10 알려진 실패 또는 차단 요인

1. 현재 저장소에 완성된 full-stack local dev 명령이 없다.
2. 정적 서버만으로는 Pages Functions를 검증하지 못한다.
3. Firebase 새 도메인이 Authorized Domains에 없으면 로그인 실패 가능성이 높다.
4. 테스트 계정과 안전한 test slot이 없으면 auth E2E가 차단된다.
5. 실제 Neon schema가 source migration과 완전히 같은지는 별도 read-only catalog 검증이 필요하다.
6. 현재 운영 배포 SHA가 GitHub 최신 `main`과 동일한지는 배포 provenance로 직접 확인해야 한다.
7. 이미지 binary 업로드 API가 없다.
8. 일부 운영 문서가 현재 코드보다 오래되었다.
9. 공개 legacy data가 아직 `{id,data}` 또는 `payload.nodes`에 의존하는지 소스만으로 확정할 수 없다.
10. 현재 문서 작성 환경에서는 테스트를 직접 실행하지 않았으므로 실제 테스트 결과는 `NOT_VERIFIED`다.

---

# 9. LoveTree 3.0 연결 권고

## 9.1 가장 안전한 1차 연결 방식

초기 단계에서는 다음 구조를 권고한다.

```text
LoveTree 3.0 브라우저
    │
    │ same-origin /api/*
    ▼
LoveTree 3.0 Cloudflare Pages Function
    │
    │ server-side reverse proxy
    ▼
https://lovebud.pages.dev/api/*
    │
    ▼
기존 LoveBud Pages Functions
    │
    ▼
기존 Modal
    │
    ▼
기존 Neon
```

### 이 방식의 장점

* LoveBud 저장소 수정 불필요
* Modal route를 새 저장소에 대량 복제하지 않아도 됨
* 현재 운영 gateway의 인증·body limit·timeout·오류 계약을 그대로 사용
* 새 브라우저는 여전히 same-origin `/api/*`만 호출
* 기존 API의 CORS 미지원 문제를 서버 측 프록시로 해결
* Modal 주소와 구조를 브라우저에 직접 노출하지 않음
* 3.0 프런트와 기존 백엔드의 책임을 명확히 분리

### 단점

* Cloudflare Pages를 한 번 더 통과하는 이중 proxy
* 기존 LoveBud 공식 도메인에 대한 운영 의존
* 약간의 latency 증가
* upstream 장애 원인 추적이 한 단계 늘어남

초기 화면 재구현과 계약 안정화 단계에서는 이 단점보다 “gateway 중복 구현을 피하는 것”이 안전하다.

## 9.2 최소 proxy 구현 원칙

새 저장소에 하나의 catch-all Pages Function을 두되 무제한 open proxy로 만들면 안 된다.

권고 경로:

```text
functions/api/[[path]].ts
```

반드시 포함할 것:

* upstream origin은 환경변수로만 설정
* `/api/` 하위 allowlist
* Authorization 전달
* `Content-Type`, `Accept`, `Idempotency-Key` 전달
* `x-lovebud-request-id` 전달 또는 새로 생성
* GET/POST/PUT/DELETE만 허용
* request body 크기 제한
* timeout
* upstream Set-Cookie는 기본 제거
* Host, CF 내부 header, Cookie를 무조건 전달하지 않음
* 응답 status와 JSON body 보존
* token·header logging 금지

권고 allowlist:

```text
trees
memories
community
private/trees
comments
youtube/oembed
```

소셜 기능이 구현될 때만 해당 하위 경로를 추가한다.

## 9.3 2차 직접 Modal 연결

LoveTree 3.0이 안정화되고 이중 proxy latency나 독립 운영 필요성이 커지면 다음으로 전환할 수 있다.

```text
LoveTree 3.0 browser
→ LoveTree 3.0 /api/*
→ LoveTree 3.0 Pages Functions
→ 기존 Modal
→ Neon
```

이때는 기존 LoveBud에서 다음 보안 경계를 선별 이전한다.

```text
functions/api/trees.js
functions/api/trees/[id].js
functions/api/memories.js
functions/api/memories/[id].js
functions/_shared/memory-route-proxy.js
필요한 public/social route
```

`functions/api/[[path]].js` 전체를 무비판적으로 복사하면 불필요한 Scout·legacy·capability route까지 함께 들어오므로 기능별로 분리하는 편이 낫다.

## 9.4 신규 저장소 최소 환경변수

### 1차 reverse proxy

```text
LOVEBUD_API_ORIGIN
```

### Firebase Web 설정

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

### 2차 direct Modal 방식에서만

```text
MODAL_BASE_URL
```

다음은 LoveTree 3.0 Pages 또는 브라우저에 필요하지 않다.

```text
DATABASE_URL
FIREBASE_SERVICE_ACCOUNT_JSON
FIREBASE_PROJECT_ID  # Modal server용 이름
CORS_ALLOWED_ORIGINS # Modal server용
```

## 9.5 배포 도메인이 달라질 때의 위험

### Firebase

반드시 신규 도메인을 Firebase Authorized Domains에 추가한다.

예:

```text
<new-project>.pages.dev
정식 custom domain
localhost
127.0.0.1
```

Google 로그인 popup/redirect가 사용하는 origin도 확인한다.

### API CORS

* 브라우저가 새 도메인의 `/api/*`만 호출하면 API CORS 변경은 불필요
* 브라우저가 `lovebud.pages.dev/api/*`를 직접 호출하면 CORS에 막힐 수 있음
* 브라우저가 Modal을 직접 호출하면 Modal `CORS_ALLOWED_ORIGINS` 수정 필요
* 직접 Modal 호출은 권고하지 않음

### URL과 navigation

기존 코드에 다음 절대·상대 경로가 섞여 있다.

```text
pages/login
pages/search
editor?treeId=
detail?treeId=
```

새 라우터에서는 기존 경로를 그대로 복사하지 말고 route adapter를 둔다.

### Firebase 프로젝트 불일치

새 프런트에서 다른 Firebase 프로젝트로 로그인하면 기존 Modal의 audience·issuer 검증을 통과하지 못한다. 인증 재사용이 목표라면 반드시 같은 Firebase 프로젝트를 사용한다.

### Content Security Policy

YouTube iframe, Google login, Firebase script/API, 이미지 CDN을 사용하는 경우 새 도메인의 CSP와 Cloudflare security header를 확인한다.

### 캐시

* public GET cache와 authenticated response를 섞지 않음
* Authorization이 있는 응답을 public cache에 저장하지 않음
* 로그아웃 시 private query cache 삭제
* 기존 LoveBud localStorage key를 그대로 복사하지 않고 `lovetree3_*` namespace 사용

## 9.6 기존 LoveBud를 수정하지 않아도 되는 부분

초기 reverse proxy 방식에서는 다음을 수정하지 않아도 된다.

* LoveBud 화면
* LoveBud Pages Function
* Modal route
* Neon schema
* 트리·기억 CRUD
* 공개 상세 API
* 댓글·반응 API
* token 검증 코드
* Plus entitlement 코드
* 기존 배포 도메인
* 기존 Vercel·Netlify artifact

## 9.7 운영 설정에서 필요한 작업

코드 수정은 아니지만 다음 운영 설정은 필요하다.

1. Firebase Authorized Domains에 LoveTree 3.0 도메인 추가
2. 새 Cloudflare Pages 프로젝트 생성
3. 새 Pages 환경변수 등록
4. same-origin `/api/*` Function 배포
5. production·preview 도메인의 Firebase 로그인 검증
6. upstream API와 request ID를 확인할 수 있는 로그 체계 마련

## 9.8 기존 LoveBud를 수정해야만 하는 경우

다음 기능을 요구할 때만 기존 백엔드 변경이 필요하다.

* 실제 이미지 파일 업로드
* cursor pagination
* 공동 편집자·공유 권한
* 복구함·soft delete tree/memory
* 새로운 memory type
* 새로운 visibility 단계
* 다른 Firebase 프로젝트 token 허용
* 신규 도메인에서 Modal 직접 호출
* API DTO 변경
* tree/memory batch write
* 새로운 AI 저장 계약
* 기존 API에 없는 검색·정렬·필터
* 3.0 전용 서버-side rendering 데이터 계약

이 경우 LoveTree 3.0에서 임의로 DB에 직접 접근하지 말고, 기존 LoveBud에 별도의 backend issue와 PR을 만들어야 한다.

---

# 10. 현재 불확실한 사항

## 10.1 GitHub 코드와 운영 환경의 차이

현재 GitHub 최신 `main` SHA는 확인했지만 다음은 별도 운영 검증이 필요하다.

* Cloudflare production deployment SHA
* Modal deployed revision
* Modal의 실제 base URL
* Neon production schema revision
* Firebase console 설정
* 현재 Authorized Domains
* 실제 CORS environment override
* Vercel 프로젝트의 잔존 여부
* production에 legacy data가 남아 있는지

운영 문서의 route matrix는 과거 production/test slot에서 Modal marker를 확인했다고 기록하지만, 이번 조사에서 live production 요청을 다시 실행한 것은 아니다.

## 10.2 운영 문서와 현재 코드의 충돌

### Vercel

* `OPERATIONS.md`: deprecated transitional fallback
* 최신 README: active deployment 또는 active fallback이 아님
* 현재 주요 Pages Function: `LOVEBUD_UPSTREAM_ORIGIN` 활성 사용 확인 안 됨
* 판단: LoveTree 3.0은 Vercel에 의존하지 않는다.

### Netlify

* 일부 오래된 환경변수 문서: Netlify function이 남은 것처럼 기술
* 현재 운영 문서: 제거된 legacy artifact
* 현재 repository: active function 없음
* 판단: 가져오지 않는다.

### CORS

* 운영 문서: Netlify origin을 active origin에서 제외
* `modal_compute/config.py` 기본 문자열: 과거 Netlify origin 포함
* 판단: 실제 Modal 환경변수 값을 운영자가 확인해야 한다.

### Tree DTO

* API 계약 문서: `payload`, `nodeCount` 포함
* 실제 current normalizer: 기본적으로 flat tree와 `memoryCount`
* 판단: 새 프런트는 live response snapshot과 current Python normalizer를 기준으로 한다.

## 10.3 데이터베이스 schema drift

`migration-repair-trees-schema-3435.sql`은 운영 `trees.id`가 text-compatible한 schema를 전제로 복구하도록 작성돼 있다. 반면 다른 migration은 UUID FK를 가정한다. 코드에서는 tree와 memory ID를 UUID 형식 문자열로 검증한다.

따라서 다음을 확정하기 전에는 migration을 실행하면 안 된다.

* production `trees.id` 물리 타입
* `memories.tree_id` 물리 타입
* FK와 cascade 상태
* social migration 적용 여부
* tree social generic target cutover 상태
* legacy `payload.nodes` 데이터 존재 여부

## 10.4 문서 노후화

다음 문서는 부분적으로만 current truth다.

* `docs/engineering/API_CONTRACT.md`: canonical naming은 유효, 일부 DTO는 오래됨
* `docs/ops/ENV_DEPENDENCY.md`: 과거 fallback·Netlify 설명 포함
* `docs/migration/**`: 당시 migration 계획
* `docs/conversation/full/**`: 현재 계약이 아님
* `docs/product/*PLAN*`: 구현 완료 여부를 코드로 재확인해야 함

## 10.5 직접 검증이 필요한 항목

LoveTree 3.0 착수 전에 다음 검증이 필요하다.

```text
[ ] Cloudflare production SHA와 main SHA 비교
[ ] /api/trees x-lovebud-upstream 확인
[ ] /api/memories x-lovebud-upstream 확인
[ ] Modal /modal/health 확인
[ ] 인증 사용자 GET /api/trees 확인
[ ] public tree detail 실제 응답 snapshot
[ ] tree create/update/delete test slot
[ ] memory create/update/delete test slot
[ ] public/private 404·403 경계
[ ] Plus private entitlement
[ ] Firebase Authorized Domains
[ ] production read-only schema catalog
[ ] Vercel fallback 실사용 여부
[ ] Modal CORS 실제 값
[ ] public legacy payload 사용 여부
```

## 10.6 담당자 판단이 필요한 항목

1. LoveTree 3.0 프런트 기술 스택
2. 1차 API 연결을 LoveBud Pages reverse proxy로 할지, Modal direct proxy로 할지
3. 신규 도메인과 custom domain
4. 기존 Firebase 프로젝트 공유 승인
5. image upload를 1차 범위에서 제외할지
6. 공개 트리 Browse 최소 기억 3개 정책 유지 여부
7. Plus/private 기능을 3.0 첫 버전에 노출할지
8. Scout를 1차 범위에 포함할지
9. tree-level social과 memory-level social을 모두 노출할지
10. 기존 legacy response adapter를 새 프런트에서도 유지할지

초기 권고는 다음과 같다.

```text
- 같은 Firebase 프로젝트 사용
- LoveBud Pages API를 server-side reverse proxy
- public tree, My Trees, Editor의 핵심 CRUD부터 구현
- image binary upload 제외
- Scout 제외
- legacy adapter 제외하되 실제 response snapshot으로 확인
- 기존 LoveBud 코드와 DB는 변경하지 않음
```

---

# 11. 최종 처리 표

| 항목       | 현재 원천      | LoveTree 3.0 처리 |
| -------- | ---------- | --------------- |
| 프런트엔드 UI | 기존 LoveBud | 새로 구현           |
| 인증       | 기존 LoveBud | 재사용             |
| API      | 기존 LoveBud | 재사용             |
| 데이터베이스   | 기존 LoveBud | 재사용             |
| 도메인 로직   | 기존 LoveBud | 재사용             |
| 배포 프록시   | 검토 필요      | 최소 연결 계층만 구현    |
| 테스트      | 기존 LoveBud | 핵심 계약만 이전       |

---

# 12. 최종 기술 결정

LoveTree 3.0은 LoveBud의 복사본이 아니라 **기존 LoveBud를 headless backend처럼 사용하는 신규 프런트엔드**로 구축한다.

첫 구현의 기준 구조는 다음과 같다.

```text
새 화면과 프런트 상태 관리
        ↓
LoveTree 3.0 same-origin /api
        ↓
LoveTree 3.0 최소 reverse proxy
        ↓
기존 LoveBud 공식 /api
        ↓
기존 Cloudflare Pages Functions
        ↓
기존 Modal
        ↓
기존 Neon
```

다음 원칙은 고정한다.

1. 기존 LoveBud 저장소는 초기 단계에서 읽기 전용으로 취급한다.
2. 브라우저는 DB·Modal·기존 LoveBud API를 cross-origin으로 직접 호출하지 않는다.
3. 같은 Firebase 프로젝트의 ID Token을 사용한다.
4. 사용자 식별자는 Firebase UID다.
5. API DTO는 flat camelCase다.
6. 트리와 기억의 소유권·공개 범위는 기존 Modal이 최종 판정한다.
7. 트리·기억 삭제는 현재 복구되지 않는 하드 삭제로 취급한다.
8. 이미지 파일 업로드는 현재 재사용 가능한 기능이 아니다.
9. Vercel·Netlify를 신규 런타임에 포함하지 않는다.
10. 운영 DB migration은 LoveTree 3.0 저장소에서 실행하지 않는다.
11. 코드보다 오래된 문서와 계획서를 current truth로 사용하지 않는다.
12. 실제 운영 연결 전에는 deployment SHA, Firebase domain, Modal health, API response, production schema를 별도로 검증한다.
