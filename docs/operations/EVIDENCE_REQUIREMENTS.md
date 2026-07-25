# LoveTree 3.0 Evidence Requirements

모든 증거는 대상 repository와 exact revision을 식별할 수 있어야 한다. 요약 문장은 원문 command, exit code, log, screenshot, metadata를 대체하지 않는다.

## Tier 1 — Repository identity

필수 항목:

- repository 이름
- branch 이름
- exact base SHA
- exact HEAD SHA
- parent chain
- merge base
- remote HEAD
- clean/dirty status

검증 시 local HEAD, remote branch HEAD, PR head가 동일한지 대조한다. dirty status가 있으면 파일명과 작업 관련성을 기록한다.

## Tier 2 — Change evidence

필수 항목:

- changed filenames
- diff stats
- actual diff
- allowed/forbidden scope 대조
- dependency 및 lockfile 변경 여부
- generated artifacts 목록
- unrelated changes 여부

PR body의 변경 설명은 실제 diff와 일치해야 한다. 파일명만 보고 범위를 판정하지 않고 patch 내용을 확인한다.

## Tier 3 — Automated verification

필수 항목:

- exact command
- exit code
- 실행한 test files
- test count
- passed, failed, skipped 수
- lint 결과
- typecheck 결과
- build 결과
- GitHub Actions run ID
- job ID
- steps와 각 conclusion
- log retrieval result
- Cloudflare deployment ID
- deployment status
- deployment commit
- preview URL

자동 검증은 exact HEAD에서 실행되어야 한다. rerun이 있으면 attempt와 최종 사용 evidence를 구분한다.

## Tier 4 — Runtime and UI

필수 항목:

- Desktop screenshot
- Mobile screenshot
- browser console 결과
- page errors
- failed requests
- response status
- loading, empty, error state
- responsive behavior
- 주요 interaction flow
- authentication 및 session behavior

screenshot은 대상 HEAD, viewport, URL, 캡처 시점을 연결할 수 있어야 한다. UI 증거는 흰색 화면이나 로딩 미완료 화면이 아니어야 한다.

## Tier 5 — Production

필수 항목:

- merge SHA
- production deployment SHA
- production deployment ID
- production URL
- health/smoke result
- rollback reference

production URL이 열리는 것만으로 충분하지 않다. deployment commit 일치와 핵심 화면·API·인증 경로의 smoke를 확인한다.

## 인정하지 않는 증거

다음은 단독 증거로 인정하지 않는다.

- “완료했습니다”
- “모두 통과했습니다”
- 원문 command 없는 요약
- exact SHA 없는 screenshot
- 다른 HEAD의 CI
- 다른 commit의 deployment
- 흰색 또는 렌더링 실패 화면
- pending을 success로 표현한 보고
- mock을 실제 API 연결로 표현한 보고
- worker self-assessment만 있는 보고
- PR body와 실제 diff가 불일치하는 상태
- preview 성공을 production 검증으로 대체한 보고
- test count나 exit code 없이 “테스트 통과”만 적은 보고

## 증거 보존과 민감정보

- secret, token, cookie, private key, service account, 실제 환경변수 값은 commit, PR, log, screenshot에 포함하지 않는다.
- 민감값은 존재 여부와 검증 결과만 기록한다.
- 외부 artifact는 파일명, hash, 생성 command, 대상 HEAD를 기록한다.
- 증거가 삭제되거나 접근 불가하면 “확인됨”으로 추정하지 않고 evidence unavailable로 기록한다.
