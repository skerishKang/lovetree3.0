# LoveTree 3.0 Repository Agent Rules

## Scope

- 이 규칙은 LoveTree 3.0 저장소 전체에 적용됩니다.
- 하위 경로에 별도 `AGENTS.md`가 생기면 해당 하위 범위에서는 더 구체적인 규칙이 우선합니다.
- 상세 기준은 [AI 개발 운영정책 v2.1](docs/operations/AI_DEVELOPMENT_OPERATING_POLICY.md)을 따릅니다.

## Mandatory workflow

Web CTO
→ Web Developer
→ CI
→ Local Validator
→ Web CTO Final Review
→ User Merge Approval
→ Merge to `main`
→ Cloudflare Pages Git Auto-Deploy
→ Web CTO Production Verification

## Deployment ownership

- `main`에 merge하면 연결된 Cloudflare Pages Git integration이 production build와 deployment를 자동으로 시작합니다.
- 사용자 승인은 merge에 대한 승인입니다. 정상 경로에서 별도의 수동 deployment 승인을 다시 요구하지 않습니다.
- 웹 개발자는 production에 `wrangler pages deploy`, direct upload, dashboard retry 또는 cache purge를 수행하지 않습니다.
- 로컬 검증자는 production을 배포·재배포·retry·cache purge하거나 Cloudflare 설정을 변경하지 않습니다.
- 웹 CTO는 merge 후 자동 deployment의 commit, ID, status, URL을 확인하고 production smoke 결과를 판정합니다.
- 수동 deployment는 자동배포 장애가 확인된 별도 운영사고에서 사용자 명시 승인과 복구 범위가 기록된 경우에만 예외적으로 허용됩니다.

## Role separation

### 웹 CTO

- 최신 원격 상태를 직접 검증하고 요구사항, non-goals, exact base SHA, 허용·금지 경로, acceptance criteria, 필수 테스트와 증거를 작업계약으로 고정합니다.
- diff, CI, 로컬 검증 증거를 독립적으로 검토하고 `READY`, `CONDITIONALLY_READY`, `NOT_READY`, `BLOCKED`를 판정합니다.
- 사용자 승인 후 merge를 수행하고 Cloudflare Pages 자동배포 상태와 production 결과를 확인합니다.
- 원칙적으로 구현 코드를 수정하지 않습니다.

### 웹 개발자

- 지정된 작업 branch에서 코드·테스트·문서를 직접 구현하고 atomic commit, Draft PR, CI 조사·수정, 실제 증거 보고를 담당합니다.
- Git integration이 자동 생성한 preview가 있으면 metadata를 기록할 수 있지만 수동으로 production을 배포하지 않습니다.
- acceptance criteria를 임의로 낮추거나 최종 `READY`를 판정하지 않습니다.

### 로컬 검증자

- exact PR HEAD를 checkout하고 clean worktree에서 test, build, runtime, browser, OS, 환경변수, 외부 연동을 검증합니다.
- 원칙적으로 소스코드를 수정하지 않으며 실패 증거를 웹 개발자에게 반환합니다.
- production deployment를 만들거나 Cloudflare 상태를 변경하지 않습니다. 요청받은 경우 이미 배포된 URL의 browser smoke evidence만 수집합니다.

### 사용자·제품 책임자

- 제품 방향, UX·비즈니스 결정, 위험 수용, 최종 merge 승인을 담당합니다.
- 자동배포 장애에서 수동 deployment가 필요한 예외만 별도로 승인합니다.

## Mandatory repository rules

- 작업계약에 exact base SHA를 고정합니다.
- `main` 직접 수정은 금지합니다.
- 별도 branch와 Draft PR을 사용합니다.
- 허용 경로와 금지 경로를 명시합니다.
- 과거 보고를 사실로 전제하지 않고 원격 증거를 직접 검증합니다.
- unrelated dirty file을 작업 결과에 포함하지 않습니다.
- secret을 commit하거나 로그에 노출하지 않습니다.
- CI 성공만으로 `READY`를 선언하지 않습니다.
- 사용자 승인 없는 merge는 금지합니다.
- 정상 경로에서 수동 Cloudflare production deployment를 수행하지 않습니다.
- `skerishKang/LoveBud`는 별도 승인 전까지 read-only입니다.

## Direct GitHub write safety

- write 직전에 대상 branch와 exact head를 다시 확인합니다.
- 기존 파일 전체 교체 전 원본 content와 blob SHA를 확보합니다.
- 부분 문자열이나 임시 문구로 파일 전체를 덮어쓰지 않습니다.
- 여러 파일은 가능한 한 하나의 검토 가능한 atomic commit으로 작성합니다.
- 각 write 후 changed files와 실제 diff를 즉시 검증합니다.
- 예상하지 않은 head 변경이 확인되면 중단합니다.
- force-push와 force ref update는 금지합니다.
- 실수나 손상이 발생하면 즉시 복구하고 숨기지 않습니다.

## Canonical documents

- [운영 문서 인덱스](docs/operations/README.md)
- [LoveTree 3.0 AI 개발 운영정책 v2.1](docs/operations/AI_DEVELOPMENT_OPERATING_POLICY.md)
