# LoveTree 3.0 Workflow Status Model

이 문서는 LoveTree 3.0 작업의 상태 의미, 진입 조건, 증거, 상태 부여 권한, 허용 전이를 고정한다.

## 상태 표

| 상태 | 의미 | 진입 조건 | 필수 증거 | 상태 부여 권한 | 허용되는 다음 상태 |
|---|---|---|---|---|---|
| `PLANNING` | 요구와 제품 의미를 분석 중 | 사용자 요구가 접수됨 | 요구 원문, 관련 자료, 현재 원격 개요 | 사용자, 웹 CTO | `WORK_ORDER_READY`, `BLOCKED` |
| `WORK_ORDER_READY` | 구현 가능한 작업계약이 확정됨 | 목표·범위·revision·수용 기준 확정 | Issue, exact base SHA, target branch, allowed/forbidden paths, acceptance criteria | 웹 CTO | `IMPLEMENTING`, `BLOCKED`, `PLANNING` |
| `IMPLEMENTING` | 지정 branch에서 구현·검증 중 | 작업계약 수락 및 exact base 확인 | branch/head, clean status, 구현 진행 기록 | 웹 개발자 | `CI_FAILED`, `CI_PASSED`, `BLOCKED` |
| `CI_FAILED` | 필수 자동 검증이 실패함 | 하나 이상의 필수 check 실패 | 실패 command, exit code, run/job/step/log | 웹 개발자, CI 시스템 | `IMPLEMENTING`, `BLOCKED` |
| `CI_PASSED` | 필수 CI가 exact HEAD에서 성공함 | 필수 check가 성공으로 종료 | exact HEAD, run/job/step, conclusion, log result, 자동 preview가 있으면 metadata | CI 시스템, 웹 개발자 보고 | `LOCAL_VALIDATION_REQUIRED`, `CTO_REVIEW` |
| `LOCAL_VALIDATION_REQUIRED` | 실환경 검증이 필요함 | CI 통과 후 로컬 검증 범위 존재 | tested HEAD, 검증 계획, 요구 환경 | 웹 CTO | `LOCAL_FAILED`, `LOCAL_PASSED`, `BLOCKED` |
| `LOCAL_FAILED` | exact HEAD의 실환경 검증 실패 | 재현 가능한 runtime/UI/integration 실패 | 환경, 명령, screenshot, console/page/network 오류, 재현 절차 | 로컬 검증자 | `IMPLEMENTING`, `BLOCKED` |
| `LOCAL_PASSED` | exact HEAD가 소스·production 무수정 실환경 검증을 통과함 | 필수 local checks 성공 | remote/local SHA 일치, clean status, 환경·명령·UI·통합 증거 | 로컬 검증자 | `CTO_REVIEW` |
| `CTO_REVIEW` | 웹 CTO가 독립 최종 검토 중 | 구현·CI·필요한 local evidence 제출 | PR diff, acceptance matrix, CI/local reports | 웹 CTO | `READY`, `CONDITIONALLY_READY`, `NOT_READY`, `BLOCKED` |
| `NOT_READY` | 수정 또는 증거 보강 없이는 승인 불가 | 결함, 범위 위반, 수용 기준 미충족 | 결함 목록, 영향, exact HEAD, 반환 조건 | 웹 CTO | `IMPLEMENTING`, `BLOCKED`, `CTO_REVIEW` |
| `CONDITIONALLY_READY` | 명시 조건을 사용자가 수용할 때만 진행 가능 | 비차단 제약·위험이 명확하고 핵심 기준은 충족 | 조건, 위험, 만료·후속 조치, exact HEAD | 웹 CTO | `READY`, `NOT_READY`, `BLOCKED` |
| `READY` | 웹 CTO가 exact HEAD를 merge 검토 가능 상태로 판정 | 범위·수용 기준·필수 증거 충족 | CTO final review, exact HEAD, known limitations | 웹 CTO만 | `MERGED`, `CTO_REVIEW`, `NOT_READY` |
| `BLOCKED` | 외부 의존성·권한·결정·환경 부재로 진행 불가 | 작업자가 통제할 수 없는 차단 사유 존재 | 차단 원문, 영향, 해제 주체와 조건 | 각 gate owner | 차단 해제 후 직전 유효 상태 |
| `MERGED` | 사용자가 승인한 exact HEAD가 default branch에 병합됨 | 사용자 명시 merge 승인 및 merge 성공 | 승인 기록, PR head, merge SHA | 사용자 승인 후 merge 담당 웹 CTO | `PRODUCTION_VERIFICATION_REQUIRED` |
| `PRODUCTION_VERIFICATION_REQUIRED` | Git integration 자동 production deployment 확인이 필요함 | merge 완료 후 Cloudflare Pages deployment가 자동 생성·queued·started됨 | merge SHA, 자동 deployment ID·commit·URL·status | 웹 CTO | `PRODUCTION_FAILED`, `PRODUCTION_VERIFIED`, `BLOCKED` |
| `PRODUCTION_FAILED` | 자동 production deployment 또는 smoke 검증 실패 | deployment 오류, queued 정체, stale artifact, commit 불일치, runtime 결함 | 자동 deployment metadata, 오류, screenshot/log, rollback reference | 웹 CTO | `PRODUCTION_VERIFICATION_REQUIRED`, `BLOCKED` |
| `PRODUCTION_VERIFIED` | 승인 revision의 자동 production deployment와 smoke가 검증됨 | deployment commit 일치 및 필수 smoke 성공 | merge SHA, deployment SHA·ID·URL, health/UI/API 결과 | 웹 CTO | 후속 작업의 `PLANNING` |

## 강제 규칙

- 웹 개발자는 `READY`를 부여할 수 없습니다.
- 로컬 검증자는 `READY`를 부여할 수 없습니다.
- `CI_PASSED`는 `READY`가 아닙니다.
- `LOCAL_PASSED`는 `READY`가 아닙니다.
- `READY`는 웹 CTO만 부여합니다.
- `READY`는 `MERGED`가 아닙니다.
- `MERGED`는 Git integration 자동배포의 trigger이며 `PRODUCTION_VERIFIED`가 아닙니다.
- 사용자 승인은 merge 승인입니다. 정상 경로에서 별도의 수동 deployment 승인 단계를 만들지 않습니다.
- deployment URL 존재만으로 `PRODUCTION_VERIFIED`가 아닙니다.
- pending, queued, in-progress는 success가 아닙니다.
- 자동배포가 queued 또는 failed이면 웹 개발자나 로컬 검증자가 수동 deployment로 상태를 건너뛰지 않습니다.
- 웹 개발자와 로컬 검증자는 `wrangler pages deploy`, direct upload, dashboard retry, cache purge로 production 상태를 변경하지 않습니다.
- 수동 deployment는 별도 운영사고와 사용자 명시 승인이 있는 예외로만 처리합니다.
- `BLOCKED`는 실패를 숨기지 않는 정상 상태입니다.
- `READY` 이후 PR HEAD가 바뀌면 기존 판정은 무효이며 `CTO_REVIEW`로 돌아갑니다.
- 로컬 검증 중 제품 소스 또는 Cloudflare production 상태가 수정되면 해당 run은 `LOCAL_PASSED` 증거가 될 수 없습니다.
