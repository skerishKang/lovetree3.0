# LoveTree 3.0 운영 문서

이 디렉터리는 LoveTree 3.0의 AI 개발 역할 분리, 상태 전이, 증거 기준, 자동배포 원칙, 역할별 보고 형식을 정의합니다.

## Canonical document

[LoveTree 3.0 AI 개발 운영정책 v2.1](AI_DEVELOPMENT_OPERATING_POLICY.md)이 운영 원칙의 canonical document입니다. 다른 문서가 상충하면 canonical policy를 우선하고, 상충 자체를 정책 변경 대상으로 기록합니다.

## Deployment baseline

- Cloudflare Pages project는 GitHub `main`과 연결되어 있습니다.
- 승인된 PR이 `main`에 merge되면 Git integration이 production build와 deployment를 자동으로 시작합니다.
- 정상 흐름은 `merge → Cloudflare Pages Git auto-deploy → Web CTO production verification`입니다.
- 웹 개발자와 로컬 검증자는 정상 흐름에서 production을 수동으로 배포하지 않습니다.
- `wrangler pages deploy`, direct upload, dashboard retry, cache purge는 표준 작업 단계가 아닙니다.
- 수동 deployment는 자동배포 장애가 확인된 별도 운영사고에서 사용자 명시 승인 후에만 예외적으로 수행합니다.

## 문서별 목적

| 문서 | 목적 |
|---|---|
| [Repository Agent Rules](../../AGENTS.md) | 저장소 진입 시 반드시 지켜야 할 짧은 강제 규칙 |
| [AI 개발 운영정책](AI_DEVELOPMENT_OPERATING_POLICY.md) | 역할, gate, 자동배포, 전달 방식, 예외, merge 이후 검증의 기준 |
| [Workflow Status Model](WORKFLOW_STATUS_MODEL.md) | 상태의 의미, 진입 조건, 권한, 허용 전이를 정의 |
| [Evidence Requirements](EVIDENCE_REQUIREMENTS.md) | revision, diff, 자동화, runtime, production 증거의 최소 기준 |
| [CTO Work Order](templates/CTO_WORK_ORDER.md) | 웹 CTO가 구현 전 범위와 완료 조건을 고정하는 형식 |
| [Web Developer Report](templates/WEB_DEVELOPER_REPORT.md) | 웹 개발자가 구현·CI 결과와 남은 검증을 보고하는 형식 |
| [Local Validation Report](templates/LOCAL_VALIDATION_REPORT.md) | 로컬 검증자가 exact HEAD의 실환경 결과를 기록하는 형식 |
| [CTO Final Review](templates/CTO_FINAL_REVIEW.md) | 웹 CTO가 독립 검토와 최종 상태를 판정하는 형식 |

## 역할별 진입점

- 웹 CTO: [CTO Work Order](templates/CTO_WORK_ORDER.md)로 작업계약을 작성한 뒤 [CTO Final Review](templates/CTO_FINAL_REVIEW.md)로 종료하고, merge 후 자동배포를 확인합니다.
- 웹 개발자: [Web Developer Report](templates/WEB_DEVELOPER_REPORT.md)에 exact revision, diff, test, CI, Draft PR 증거를 기록합니다. Git integration이 자동 생성한 preview가 있으면 metadata만 기록합니다.
- 로컬 검증자: [Local Validation Report](templates/LOCAL_VALIDATION_REPORT.md)에 소스 무수정 상태의 실환경 결과를 기록합니다. production deployment를 생성하거나 변경하지 않습니다.
- 사용자·제품 책임자: 웹 CTO의 final status와 위험·제약을 확인한 뒤 merge 승인 여부를 결정합니다. 자동배포 장애의 수동 복구만 별도 승인합니다.

## 권장 읽기 순서

[AGENTS.md](../../AGENTS.md)
→ [AI_DEVELOPMENT_OPERATING_POLICY.md](AI_DEVELOPMENT_OPERATING_POLICY.md)
→ [WORKFLOW_STATUS_MODEL.md](WORKFLOW_STATUS_MODEL.md)
→ [EVIDENCE_REQUIREMENTS.md](EVIDENCE_REQUIREMENTS.md)
→ 역할별 template

## Template 사용법

1. 항목을 삭제하지 않고 해당 작업의 실제 값과 증거로 채웁니다.
2. exact SHA, 명령, exit code, URL, run/job/deployment identifier는 요약 문장으로 대체하지 않습니다.
3. 적용되지 않는 항목은 삭제하지 말고 적용되지 않는 이유를 기록합니다.
4. 웹 개발자 보고와 로컬 검증 보고는 동일한 PR HEAD를 대상으로 해야 합니다.
5. 템플릿의 권한 구분을 변경하거나 작업자 자신이 상위 역할의 상태를 대신 판정하지 않습니다.
6. preview 또는 production deployment를 수동으로 만들지 말고 Git integration이 생성한 metadata를 관찰·기록합니다.

## 신규 작업 적용법

1. 웹 CTO가 원격 상태를 재검증하고 Issue 및 작업계약을 작성합니다.
2. 작업계약은 exact base SHA, target branch, allowed/forbidden paths, acceptance criteria, required evidence를 고정합니다.
3. 별도 웹 개발자가 지정 branch에서 구현하고 Draft PR과 CI 증거를 제출합니다.
4. 필요한 경우 로컬 검증자가 exact PR HEAD를 실환경에서 검증합니다.
5. 웹 CTO가 원격 diff, CI, local evidence를 독립 검토합니다.
6. 사용자가 명시적으로 승인한 뒤에만 `main`에 merge합니다.
7. merge가 Cloudflare Pages Git 자동배포를 트리거합니다.
8. 웹 CTO가 merge SHA와 자동 production deployment SHA를 대조하고 production smoke를 확인합니다.
9. 자동배포가 queued, failed 또는 stale이면 수동 배포를 즉시 수행하지 않고 `BLOCKED` 또는 `PRODUCTION_FAILED`로 기록한 뒤 별도 운영사고로 처리합니다.

## 기존 Draft PR 적용법

- 이미 열려 있는 Draft PR은 당시 작업계약과 현재 정책을 함께 대조합니다.
- 정책 도입 전에 생성된 commit을 재작성하거나 rebase하지 않습니다.
- 기존 PR의 exact base/head, changed files, CI, local evidence, 남은 위험을 현재 템플릿 수준으로 보강합니다.
- 범위 충돌이나 증거 결손은 숨기지 않고 `NOT_READY` 또는 `BLOCKED` 사유로 기록합니다.
- 기존 Draft PR의 구현 branch, Issue, acceptance criteria를 이 문서 도입을 이유로 임의 변경하지 않습니다.
