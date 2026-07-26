# LoveTree 3.0 AI 개발 운영정책 v2.1

## 1. 목적

이 정책은 LoveTree 3.0 개발에서 설계·범위 결정, GitHub 구현, 실환경 검증, 최종 승인, production 확인 권한을 분리한다. 목표는 구현 속도를 높이면서도 자기검증 편향, revision 불일치, 증거 없는 완료 선언, 사용자 승인 없는 merge, 불필요한 수동 production 변경을 방지하는 것이다.

## 2. 적용 범위

- LoveTree 3.0 저장소의 코드, 테스트, 문서, 설정, CI, preview, production 변경에 적용한다.
- 사람과 AI 작업자 모두에게 적용한다.
- 저장소 루트 [AGENTS.md](../../AGENTS.md)는 진입 규칙이며, 이 문서는 canonical policy이다.
- 하위 `AGENTS.md`가 존재하면 해당 하위 범위에서 더 구체적인 규칙이 우선하지만 이 정책의 역할·승인·자동배포 원칙을 약화할 수 없다.
- `skerishKang/LoveBud`는 별도 승인이 없는 한 참조용 read-only 저장소다.

## 3. 기본 원칙

1. **역할 분리**: 작업계약, 구현, 로컬 검증, 최종 판정, merge 승인을 같은 역할이 독점하지 않는다.
2. **증거 우선**: 주장보다 exact SHA, diff, 명령 원문, exit code, CI log, screenshot, deployment metadata를 우선한다.
3. **Exact revision 고정**: 모든 구현·검증·판정은 repository, branch, exact base SHA, exact HEAD SHA를 명시한다.
4. **`main` 직접 수정 금지**: 모든 변경은 별도 branch와 Draft PR을 사용한다.
5. **CI는 필요조건이지 충분조건이 아님**: CI 성공은 `READY`를 자동으로 의미하지 않는다.
6. **실패를 숨기지 않음**: 실패, pending, queued, 증거 부재, 외부 의존성 미확인은 그대로 기록한다.
7. **Product meaning 보호**: 사용자 경험, 비즈니스 규칙, 권한 의미, 데이터 의미의 변경은 사용자 승인이 필요하다.
8. **완료 보고 불신**: 작업자의 “완료” 문장을 증거로 사용하지 않고 원격 상태와 산출물을 직접 확인한다.
9. **범위 고정**: 구현 결과에 맞추어 acceptance criteria를 낮추거나 금지 경로를 사후 허용하지 않는다.
10. **Merge 승인과 자동배포**: 사용자는 merge를 승인한다. 승인된 PR이 `main`에 merge되면 Cloudflare Pages Git integration이 production build와 deployment를 자동으로 시작한다.
11. **수동 production 변경 금지**: 정상 경로에서 웹 개발자와 로컬 검증자는 production deployment, retry, cache purge, direct upload 또는 Cloudflare 설정 변경을 수행하지 않는다.
12. **Production 검증은 관찰 작업**: 자동으로 생성된 deployment의 revision과 runtime을 확인하는 것이 표준이며, deployment를 새로 만드는 것은 표준 검증 단계가 아니다.

## 4. 역할과 책임

### 사용자·제품 책임자

- 제품 목표, 우선순위, UX·비즈니스 결정을 확정한다.
- 기능 축소, 제약 수용, 알려진 위험 수용 여부를 결정한다.
- 최종 merge를 승인하거나 거부한다.
- 정상 merge로 시작되는 Cloudflare Pages 자동배포는 별도의 두 번째 수동 작업 승인을 요구하지 않는다.
- 자동배포 장애에서 수동 deployment나 Cloudflare 설정 변경이 필요한 예외만 별도로 승인한다.
- 제품 의미가 바뀌는 예외를 승인한다.

### 웹 CTO

- 최신 GitHub 원격 상태와 관련 Issue·PR을 직접 검증한다.
- 요구사항, user-visible outcome, non-goals를 명시한다.
- exact base SHA, target branch, allowed/forbidden paths를 고정한다.
- acceptance criteria와 required tests/evidence를 정의한다.
- 보안, 개인정보, 인증, 권한, API, 데이터베이스, 아키텍처 경계를 정한다.
- 실제 diff, commit chain, CI, local evidence, 자동 preview evidence를 독립 검토한다.
- 최종 상태를 `READY`, `CONDITIONALLY_READY`, `NOT_READY`, `BLOCKED` 중 하나로 판정한다.
- 사용자 승인 후 merge 결과 SHA를 확인한다.
- merge 후 Cloudflare Pages Git integration이 만든 production deployment의 commit, ID, status, URL과 smoke 결과를 확인한다.
- 자동배포가 queued, failed, stale 또는 revision mismatch이면 상태를 정확히 기록하고 별도 운영사고 범위를 정의한다.
- 원칙적으로 구현 코드를 수정하지 않는다. 긴급 예외는 제10절 절차를 따라 역할 충돌과 재검증 필요성을 기록한다.

### 웹 개발자

- 시작 시 default branch, exact base SHA, 열린 관련 Issue·PR, target branch 상태를 재검증한다.
- 작업계약의 exact base에서 별도 branch를 생성한다.
- 허용 범위 안에서 코드, 테스트, 문서를 직접 구현한다.
- 변경을 검토 가능한 atomic commit으로 구성하고 Draft PR을 생성한다.
- 로컬 자동 검증을 실행하고 GitHub CI 실패를 분석·수정한다.
- exact command, exit code, test count, run/job/step/log, changed files, diff를 증거로 제출한다.
- Git integration이 자동으로 만든 preview deployment가 있으면 commit·ID·status·URL을 기록한다.
- preview 또는 production을 만들기 위해 `wrangler pages deploy`, direct upload, dashboard retry, cache purge를 실행하지 않는다.
- acceptance criteria, non-goals, allowed/forbidden paths를 임의 변경하지 않는다.
- `READY`, merge 가능 여부, production 완료를 최종 판정하지 않는다.

### 로컬 검증자

- 원격의 exact PR HEAD를 checkout하고 remote HEAD와 일치하는지 확인한다.
- 검증 시작·종료 시 clean worktree를 확인한다.
- dependency installation, test, lint, typecheck, build, runtime을 실제 환경에서 수행한다.
- desktop/mobile, browser console, page error, failed request, loading·empty·error state, 주요 interaction flow를 검증한다.
- Firebase, LoveBud, 환경변수, secret, 외부 계정 등 CI가 대체할 수 없는 연동을 검증한다.
- Cloudflare 관련 검증은 이미 존재하는 preview 또는 production URL의 read-only browser/API smoke로 제한한다.
- production deployment 생성, retry, cache purge, direct upload, alias 변경, project 설정 변경을 수행하지 않는다.
- 원칙적으로 소스코드를 수정하지 않는다.
- 수정이 필요하면 해당 run을 독립 검증으로 판정하지 않고 실패 증거를 웹 개발자에게 반환한다.
- `READY` 또는 production 완료를 판정하지 않는다.

## 5. Cloudflare Pages 자동배포 기준

- Cloudflare Pages project는 GitHub 저장소의 `main` branch와 Git integration으로 연결되어 있다.
- 승인된 PR의 `main` merge가 production build와 deployment의 정상 trigger다.
- feature branch push 또는 PR update가 preview deployment를 생성할 수 있으며, 이는 Cloudflare Git integration이 자동으로 수행한다.
- preview가 생성되지 않았다는 이유만으로 작업자가 수동 preview deployment를 만들지 않는다. 필요성은 웹 CTO가 별도 계약으로 판단한다.
- merge 후 production deployment가 자동으로 생성되지 않거나 queued에서 진행되지 않으면 `BLOCKED` 또는 `PRODUCTION_FAILED`로 기록한다.
- 자동배포 장애를 Git commit, 빈 파일, rebuild marker, 의미 없는 source 변경으로 우회하지 않는다.
- 수동 deployment는 별도 운영사고, 사용자 명시 승인, exact source revision, 복구 목적, rollback 조건이 기록된 경우에만 허용한다.
- 수동 deployment가 수행된 경우에도 Git integration 복구 여부를 별도로 추적하며 이를 정상 표준으로 문서화하지 않는다.

## 6. 표준 작업 흐름

### Gate 0 — Intake / `PLANNING`

- **Owner**: 사용자·제품 책임자, 웹 CTO
- **Input**: 사용자 요구, 화면 자료, 기존 Issue·PR, 저장소 현황
- **Required evidence**: 요구 원문, 관련 자료 식별자, 최신 default branch와 열린 작업 목록
- **Exit criteria**: 목표, 제품 의미, 우선순위, 불명확한 결정사항이 식별됨
- **Failure transition**: 제품 결정이 없으면 `BLOCKED`; 추가 분석이 필요하면 `PLANNING` 유지

### Gate 1 — CTO Work Order / `WORK_ORDER_READY`

- **Owner**: 웹 CTO
- **Input**: Gate 0 결과와 최신 원격 상태
- **Required evidence**: Issue, exact base SHA, target branch, allowed/forbidden paths, acceptance criteria, tests, local validation, security/privacy boundaries
- **Exit criteria**: 별도 웹 개발자가 해석 없이 실행할 수 있는 작업계약이 확정됨
- **Failure transition**: 범위 충돌 또는 기준 불충분 시 `PLANNING`; 외부 결정 대기 시 `BLOCKED`

### Gate 2 — Web Development and CI / `IMPLEMENTING` → `CI_PASSED`

- **Owner**: 웹 개발자
- **Input**: 승인된 작업계약
- **Required evidence**: branch base, commit chain, changed files, diff, local commands와 exit code, Draft PR, Actions metadata, 자동 생성된 preview가 있으면 해당 metadata
- **Exit criteria**: 범위와 acceptance criteria를 만족하는 구현이 원격 Draft PR에 있고 필수 CI가 성공함
- **Failure transition**: CI 실패는 `CI_FAILED`; 범위·권한·외부 의존성으로 진행 불가하면 `BLOCKED`
- **Deployment boundary**: 이 Gate에서 production 수동 deployment를 수행하지 않는다.

### Gate 3 — Local Environment Validation / `LOCAL_VALIDATION_REQUIRED` → `LOCAL_PASSED`

- **Owner**: 로컬 검증자
- **Input**: CI를 통과한 exact PR HEAD와 검증 절차
- **Required evidence**: remote/local SHA 일치, clean status, OS·runtime·browser, 명령과 결과, desktop/mobile evidence, console/page/network 결과, 외부 연동 결과
- **Exit criteria**: 소스 수정과 production mutation 없이 필수 실환경 검증이 통과함
- **Failure transition**: 재현 가능한 실패는 `LOCAL_FAILED` 후 웹 개발자에게 반환; 환경 확보 불가 시 `BLOCKED`
- **Deployment boundary**: Local은 production을 deploy, retry, purge 또는 설정 변경하지 않는다.

### Gate 4 — CTO Final Review / `CTO_REVIEW`

- **Owner**: 웹 CTO
- **Input**: exact PR diff, CI evidence, local validation report, Issue와 작업계약
- **Required evidence**: scope matrix, acceptance criteria matrix, code/test/security/regression review, 자동 preview가 있으면 revision review
- **Exit criteria**: `READY`, `CONDITIONALLY_READY`, `NOT_READY`, `BLOCKED` 중 하나가 근거와 함께 부여됨
- **Failure transition**: 수정 필요 시 `NOT_READY` 후 `IMPLEMENTING`; 필수 증거 또는 의존성 부재 시 `BLOCKED`

### Gate 5 — User Approval and Merge / `READY` → `MERGED`

- **Owner**: 사용자·제품 책임자, merge 담당 웹 CTO
- **Input**: 웹 CTO final review와 알려진 위험
- **Required evidence**: 사용자 명시 merge 승인, merge 직전 exact PR HEAD, merge 결과 SHA
- **Exit criteria**: 승인된 exact HEAD가 허용된 방식으로 `main`에 merge됨
- **Automatic effect**: merge가 Cloudflare Pages Git production build/deployment를 자동으로 trigger함
- **Failure transition**: 승인이 없으면 `READY` 또는 `CONDITIONALLY_READY` 유지; head 변경 시 `CTO_REVIEW`로 복귀

### Gate 6 — Automatic Production Verification / `PRODUCTION_VERIFICATION_REQUIRED` → `PRODUCTION_VERIFIED`

- **Owner**: 웹 CTO
- **Input**: merge SHA와 Cloudflare Pages Git integration이 자동 생성한 production deployment
- **Required evidence**: production deployment SHA·ID·URL·status, health/smoke 결과, 핵심 UI·API 확인, rollback reference
- **Exit criteria**: 자동 production deployment가 merge revision을 실행하며 필수 smoke가 성공함
- **Optional evidence support**: 웹 CTO가 요청하면 로컬 검증자는 이미 배포된 URL의 read-only browser smoke evidence를 제공할 수 있다.
- **Failure transition**: 자동배포가 queued·failed·stale이면 `PRODUCTION_FAILED` 또는 `BLOCKED`; 영향이 지속되면 rollback 또는 별도 운영사고 작업계약으로 전환
- **Deployment boundary**: production 검증을 이유로 웹 개발자나 로컬 검증자가 수동 deployment를 수행하지 않는다.

## 7. 구현 전달 방식

### Mode A — Direct GitHub Implementation

기본 방식이다.

- 웹 개발자는 exact base에서 target branch를 만들고 허용 경로만 직접 수정한다.
- 여러 파일은 가능한 한 하나의 검토 가능한 atomic commit으로 구성한다.
- write 전후 branch/head, changed files, diff를 확인한다.
- Draft PR을 생성하고 CI 실패를 같은 branch에서 후속 atomic commit으로 수정한다.
- force-push, force ref update, 사용자 승인 없는 merge는 금지한다.
- production deployment 명령은 구현 전달 범위에 포함하지 않는다.

### Mode B — Patch Package

GitHub 직접 write가 불가능하거나 사용자가 파일 전달 방식을 지정한 경우 사용한다. 패키지는 다음을 포함해야 한다.

- repository-relative 경로를 유지한 변경 파일
- 전체 unified diff
- 적용 대상 exact base SHA
- 파일별 SHA-256 manifest
- `APPLY.md`
- `TEST_PLAN.md`
- `REVIEW_NOTES.md`

수신자는 exact base 일치와 manifest를 확인한 뒤 적용한다. 경로 조정이나 충돌 해결로 내용이 바뀌면 새 diff와 새 HEAD를 기준으로 검증한다. Patch 적용 후에도 deployment는 `main` merge에 따른 Git integration이 담당한다.

### Mode C — Local Environment Validation

Windows, WSL, 실제 browser, Firebase, LoveBud API, secret, 외부 계정처럼 GitHub CI만으로 검증할 수 없는 항목을 담당한다.

- exact PR HEAD를 사용한다.
- 환경값은 저장소나 로그에 기록하지 않는다.
- 환경 전용 조정은 웹 CTO가 사전에 허용한 범위만 사용하고 보고서에 명시한다.
- 제품 소스를 수정한 run은 독립 검증으로 인정하지 않는다.
- Cloudflare production은 read-only로 확인하며 deployment 또는 project mutation을 수행하지 않는다.

## 8. 테스트 및 자동화 경계

- unit, component, integration, E2E, contract test는 production deployment를 실행하지 않는다.
- 테스트 command와 test fixture는 `wrangler pages deploy`, Cloudflare deployment create/retry API, cache purge API, alias 변경 또는 dashboard 자동화를 호출하지 않는다.
- build command는 산출물 생성까지만 담당하며 deployment command로 취급하지 않는다.
- production smoke는 GET/HEAD 중심의 read-only 확인을 기본으로 하며, 제품 acceptance가 명시한 API mutation 외 Cloudflare 운영 상태를 변경하지 않는다.
- deployment metadata가 필요한 테스트는 mock 또는 fixture를 사용하고 실제 production deployment를 생성하지 않는다.
- CI는 Cloudflare Git integration이 자동 생성한 preview status를 관찰할 수 있지만 production direct upload를 수행하지 않는다.

## 9. 필수 보고 형식

- 웹 CTO는 [CTO Work Order](templates/CTO_WORK_ORDER.md)를 사용한다.
- 웹 개발자는 [Web Developer Report](templates/WEB_DEVELOPER_REPORT.md)를 사용한다.
- 로컬 검증자는 [Local Validation Report](templates/LOCAL_VALIDATION_REPORT.md)를 사용한다.
- 웹 CTO 최종 검토는 [CTO Final Review](templates/CTO_FINAL_REVIEW.md)를 사용한다.
- revision과 증거의 최소 기준은 [Evidence Requirements](EVIDENCE_REQUIREMENTS.md)를 따른다.
- 상태 전이와 상태 부여 권한은 [Workflow Status Model](WORKFLOW_STATUS_MODEL.md)을 따른다.

## 10. 금지사항과 예외

### 금지사항

- `main` 직접 수정
- 작업계약에 없는 경로 또는 저장소 수정
- unrelated dirty file 포함
- secret, token, private key, service account, 민감한 환경변수의 commit·로그 노출
- 다른 HEAD의 CI나 screenshot을 현재 HEAD의 증거로 사용
- pending, queued, skipped, cancelled를 success로 표현
- mock 상태를 API-connected, authenticated, deployed, production으로 표현
- 실패를 숨기거나 원문 오류를 제거한 요약만 제출
- acceptance criteria를 구현 결과에 맞춰 하향
- 웹 개발자 또는 로컬 검증자의 최종 `READY` 판정
- `READY`를 merge 명령으로 해석
- 사용자 승인 없는 merge
- 정상 경로의 수동 production deployment, dashboard retry, cache purge, direct upload
- 자동배포를 유발하기 위한 의미 없는 source commit 또는 rebuild marker
- force-push, force ref update, 증거 추적성을 파괴하는 history rewrite

### 예외 처리

- 예외는 사용자·제품 책임자와 웹 CTO가 필요성, 범위, 위험, 만료 조건을 명시적으로 승인해야 한다.
- 보안·개인정보·권한 경계를 약화하는 예외는 허용하지 않는다.
- 웹 CTO가 긴급 구현을 수행한 경우 역할 충돌을 기록하고, 별도 웹 개발자 또는 독립 검토자가 diff를 재검토하며 필요한 검증을 생략하지 않는다.
- 로컬 검증자가 환경 복구를 위해 소스가 아닌 로컬 설정을 조정한 경우 조정 내용과 영향 범위를 기록한다.
- 자동배포 장애에서 수동 deployment가 필요한 경우 별도 운영사고로 기록하고 사용자 명시 승인, exact revision, 명령, actor, deployment ID, rollback 조건을 남긴다.
- 외부 서비스 장애나 권한 부족은 `BLOCKED`로 표기한다. `BLOCKED`는 실패 은폐가 아니라 정상적인 통제 상태다.

## 11. 기존 Draft PR 적용 방식

- 기존 Draft PR, Issue, feature branch의 범위와 history를 정책 도입만을 이유로 변경하지 않는다.
- 기존 commit을 amend, rebase, force-push로 재작성하지 않는다.
- 현재 정책에 맞춰 exact base/head, parent chain, changed files, diff, CI, local validation, known limitations를 보강한다.
- 기존 acceptance criteria와 현재 정책이 충돌하면 웹 CTO가 차이를 명시하고 사용자 결정을 받는다.
- 다른 병행 PR의 commit을 무단 merge 또는 cherry-pick하지 않는다.
- 정책 문서 PR은 다른 기능 Draft PR의 구현 파일·Issue·branch를 수정하지 않는다.
- 과거 문서에 수동 deployment가 표준 단계로 적혀 있더라도 v2.1 이후 정상 경로에는 적용하지 않는다.

## 12. Merge 이후 Production 검증

- merge 결과 SHA를 기록한다.
- Cloudflare Pages Git integration이 자동 생성한 production deployment를 확인한다.
- deployment ID, deployment commit, production URL, queued·started·completed·failed 상태를 기록한다.
- production deployment commit이 merge SHA 또는 Cloudflare가 표시하는 동등한 source revision과 일치하는지 확인한다.
- health endpoint 또는 최소 smoke, 핵심 화면 렌더링, 주요 interaction, 인증·API 경로를 확인한다.
- 흰색 화면, 깨진 렌더링, console/page error, 반복 실패 요청은 성공으로 인정하지 않는다.
- preview 성공을 production 성공으로 대체하지 않는다.
- 자동배포가 실패하거나 stale artifact를 제공하면 `PRODUCTION_FAILED` 또는 `BLOCKED`로 전환하고 영향, rollback 가능성, rollback reference, 후속 운영사고를 기록한다.
- production verification은 자동 deployment를 관찰하는 단계이며 일반 작업자에게 수동 deployment를 지시하는 단계가 아니다.

## 13. 정책 변경 절차

1. 정책 변경은 별도 Issue와 Draft PR로 제안한다.
2. 변경 이유, 영향을 받는 역할·상태·template, migration 방식을 명시한다.
3. canonical policy, status model, evidence requirements, templates, `AGENTS.md`의 상충 여부를 함께 검토한다.
4. 역할 분리, exact revision, 사용자 merge 승인, Git 자동배포 원칙을 약화하는 변경은 사용자 명시 승인이 필요하다.
5. 승인·merge 후 정책 버전과 적용일을 갱신하고 기존 진행 중 작업에 대한 적용 방식을 기록한다.

## LoveTree 3.0 전용 규칙

- `skerishKang/LoveBud`는 별도 승인 전까지 read-only다.
- handoff 문서를 단독 사실 원천으로 사용하지 않고 LoveBud 실제 `main` 코드 및 현재 원격 상태와 교차검증한다.
- 제공된 화면 이미지는 원본 파일과 exact revision을 식별할 수 있는 evidence로 검토한다.
- 완전한 흰색, 깨진 렌더링, 잘린 핵심 영역, 로딩 미완료 screenshot은 증거로 인정하지 않는다.
- `mock`, `API-connected`, `authenticated`, `deployed`, `production` 상태를 구분하여 보고한다.
- Firebase, Cloudflare, LoveBud secret을 저장소, PR body, Actions log, screenshot에 저장하지 않는다.
- 배포 URL만 확인하지 않고 자동 deployment commit이 merge commit과 일치하는지 확인한다.
- UI의 의미, 정보 구조, 주요 interaction, 비즈니스 규칙 변경은 사용자 승인이 필요하다.
- API, 권한, 데이터베이스, 도메인 로직을 프런트엔드에서 임의 재정의하지 않는다.
