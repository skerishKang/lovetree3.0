# CTO Final Review

웹 CTO는 작업자 보고를 그대로 받아들이지 않고 아래 항목을 exact revision 기준으로 독립 검토합니다.

## Review identity

- Reviewed repository: 실제 `owner/repository`
- Reviewed HEAD SHA: 검토한 40자리 PR head
- Base and merge base: base branch SHA와 merge base
- PR state: 번호, OPEN 여부, Draft 여부, base/head
- Issue state: 번호, OPEN 여부, acceptance criteria

## Review matrix

### Scope review

allowed/forbidden paths, unrelated changes, dependency·config·reference 변경을 확인합니다.

### Acceptance criteria matrix

각 acceptance criterion에 대해 충족, 미충족, 증거 부족을 구분하고 근거를 연결합니다.

### Code review

구현 정확성, failure path, 유지보수성, API·권한·도메인 경계 준수를 검토합니다.

### Test quality review

테스트가 실제 behavior와 failure path를 검증하는지, exact HEAD에서 실행됐는지 확인합니다. 테스트나 build command가 production deployment, Cloudflare retry, cache purge 또는 direct upload를 실행하지 않는지 확인합니다.

### CI review

run/job/step/log, conclusion, pending·skipped·cancelled를 직접 확인합니다. Git integration이 자동 preview를 만든 경우에만 preview deployment metadata를 확인합니다.

### Local validation review

tested HEAD, clean status, 환경, desktop/mobile, console/page/network, 외부 연동, 소스 무수정 여부를 확인합니다. Local이 Cloudflare production 또는 deployment 상태를 변경하지 않았는지 확인합니다.

### Security/privacy review

secret, 인증, 권한, 개인정보, logging, 외부 연동 위험을 검토합니다.

### Regression review

기존 사용자 흐름, 화면, API, build, bundle, 설정에 대한 회귀 가능성과 증거를 검토합니다.

### Pre-merge deployment boundary review

- 웹 개발자와 로컬 검증자가 production 수동 deployment를 수행하지 않았는지 확인합니다.
- 자동배포를 유발하기 위한 빈 commit, rebuild marker 또는 의미 없는 source 변경이 없는지 확인합니다.
- preview evidence는 production verification을 대체하지 않습니다.
- production review는 merge 전 final status에 포함하지 않고 merge 후 별도 상태로 수행합니다.

## Decision

### Known limitations

현재 revision에 남는 제약, 사용자 수용이 필요한 위험, 후속 작업을 기술합니다.

### Final status

다음 중 하나만 부여합니다.

- `READY`
- `CONDITIONALLY_READY`
- `NOT_READY`
- `BLOCKED`

### Merge recommendation

final status와 별도로 사용자가 승인할 수 있는 범위, merge 전 조건, 승인하지 말아야 할 사유를 기술합니다. 사용자 승인은 merge 승인이고, 승인된 merge가 Cloudflare Pages Git 자동배포를 trigger합니다.

### Required follow-up

수정 주체, exact scope, 재검증 gate, 후속 Issue를 기술합니다. 정상 경로에서 웹 개발자나 로컬 검증자에게 production deployment를 지시하지 않습니다.

## Post-merge automatic production verification

merge 후 웹 CTO가 별도로 확인합니다.

- Merge SHA
- Cloudflare Pages automatic production deployment ID
- Deployment source commit
- Queued, started, completed 또는 failed 상태
- Production URL
- Health/UI/API/auth smoke
- Rollback reference

자동 deployment가 merge revision을 정상 제공하면 `PRODUCTION_VERIFIED`로 판정합니다. queued 정체, 실패, stale artifact 또는 revision mismatch가 있으면 `PRODUCTION_FAILED` 또는 `BLOCKED`로 판정하고 별도 운영사고를 정의합니다.

수동 deployment는 자동배포 장애가 확인된 별도 운영사고에서 사용자 명시 승인 후에만 예외적으로 수행할 수 있으며, final review의 정상 후속 단계가 아닙니다.
