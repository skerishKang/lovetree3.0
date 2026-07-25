# Local Validation Report

로컬 검증자는 원격 exact PR HEAD를 소스 수정 없이 실제 환경에서 검증합니다.

## Revision and environment

- Repository: 실제 `owner/repository`
- Branch: 검증 branch
- Tested HEAD SHA: 로컬에서 검증한 40자리 SHA
- Remote HEAD SHA: 검증 직전 원격 branch의 40자리 SHA
- `git status`: 시작·종료 시 전체 결과
- OS: edition, version, architecture
- Node/npm: exact versions
- Browser: 이름과 exact version

## Commands

- Install command: exact command와 exit code
- Test command: exact command, test count, 결과, exit code
- Build command: exact command와 exit code
- Runtime command: exact command, port, 종료 방법

## Runtime and UI results

- Desktop result: viewport, URL, interaction, 결과
- Mobile result: viewport, URL, interaction, 결과
- Console errors: 오류 원문 또는 오류 없음 증거
- Page errors: browser page error 원문 또는 없음
- Failed requests: URL 경로, method, status, 응답 분류
- External integration: Firebase, LoveBud, Cloudflare, 환경변수, 외부 계정 검증 결과
- Screenshots/artifacts: 파일명, hash, 대상 HEAD, 캡처 조건
- Reproduction steps: 실패를 재현하는 최소 단계
- Local source modifications: 수정 파일과 이유 또는 소스 수정 없음

## Independence rules

- 로컬 소스 수정이 있으면 해당 run은 독립 검증으로 인정하지 않습니다.
- 웹 CTO가 사전에 허용한 환경 전용 조정은 조정 내용, 승인 근거, 영향 범위를 별도 기록합니다.
- 실패 시 제품 코드를 직접 고치지 않고 증거와 재현 절차를 웹 개발자에게 반환합니다.
- local `PASS`는 웹 CTO의 `READY`를 의미하지 않습니다.

## Final result

다음 중 하나만 사용합니다.

- `PASS`
- `FAIL`
- `BLOCKED`
