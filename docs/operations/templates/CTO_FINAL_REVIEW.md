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

allowed/forbidden paths, unrelated changes, dependency·config·deployment·reference 변경을 확인합니다.

### Acceptance criteria matrix

각 acceptance criterion에 대해 충족, 미충족, 증거 부족을 구분하고 근거를 연결합니다.

### Code review

구현 정확성, failure path, 유지보수성, API·권한·도메인 경계 준수를 검토합니다.

### Test quality review

테스트가 실제 behavior와 failure path를 검증하는지, exact HEAD에서 실행됐는지 확인합니다.

### CI review

run/job/step/log, conclusion, pending·skipped·cancelled, deployment metadata를 직접 확인합니다.

### Local validation review

tested HEAD, clean status, 환경, desktop/mobile, console/page/network, 외부 연동, 소스 무수정 여부를 확인합니다.

### Security/privacy review

secret, 인증, 권한, 개인정보, logging, 외부 연동 위험을 검토합니다.

### Regression review

기존 사용자 흐름, 화면, API, build, bundle, 설정에 대한 회귀 가능성과 증거를 검토합니다.

### Deployment review

preview 및 production의 deployment commit, ID, URL, smoke, rollback reference를 구분합니다.

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

final status와 별도로 사용자가 승인할 수 있는 범위, merge 전 조건, 승인하지 말아야 할 사유를 기술합니다.

### Required follow-up

수정 주체, exact scope, 재검증 gate, 후속 Issue 또는 production verification을 기술합니다.
