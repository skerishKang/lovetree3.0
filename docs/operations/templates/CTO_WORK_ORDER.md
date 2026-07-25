# CTO Work Order

웹 CTO는 구현 시작 전에 이 형식의 모든 항목을 실제 원격 상태와 사용자 결정으로 확정합니다.

## Repository identity

| 항목 | 기록 기준 |
|---|---|
| Repository | `owner/repository` 전체 이름 |
| Issue | 작업 범위와 acceptance criteria가 고정된 Issue 번호와 URL |
| Default branch | 원격 저장소의 실제 default branch |
| Exact base SHA | 작업 branch가 시작할 40자리 commit SHA |
| Target branch | 새 작업 branch의 정확한 이름 |

## Product contract

### Objective

사용자 요구를 구현 관점이 아니라 달성해야 할 제품 결과로 기술합니다.

### User-visible outcome

사용자가 실제로 보거나 수행하게 되는 변화와 변화가 없는 영역을 기술합니다.

### Non-goals

이번 작업에서 의도적으로 하지 않는 기능, 리팩터링, migration, 디자인 변경을 열거합니다.

## Scope contract

### Allowed paths

수정 가능한 repository-relative 경로를 명시합니다.

### Forbidden paths

수정이 금지된 repository-relative 경로와 다른 저장소를 명시합니다.

### Required implementation

필수 동작, failure behavior, 문서, 테스트, migration 또는 config 조건을 구체적으로 기술합니다.

## Risk boundaries

### Security/privacy boundaries

인증, 권한, 개인정보, secret, logging, API, 데이터베이스 경계를 기술합니다.

## Verification contract

### Required tests

실행할 exact command, 집중 테스트, 전체 회귀, lint, typecheck, build 기준을 기술합니다.

### Required local validation

필요한 OS, browser, viewport, runtime, 외부 연동, 계정, 환경변수와 검증 시나리오를 기술합니다.

### Required evidence

repository identity, diff, command output, CI, runtime, screenshot, deployment evidence의 최소값을 기술합니다.

### Acceptance criteria

검증 가능한 체크 항목으로 작성하며 구현 결과에 따라 사후 하향하지 않습니다.

### Completion definition

웹 개발자가 종료 보고를 제출할 조건, 로컬 검증으로 넘길 조건, 웹 CTO 재검토 요청 조건을 구분합니다.

### Merge authority

웹 CTO의 `READY` 판정과 사용자의 명시적 merge·deployment 승인이 별도임을 명시합니다.
