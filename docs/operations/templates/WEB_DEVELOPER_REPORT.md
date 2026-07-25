# Web Developer Report

웹 개발자는 실제 원격·로컬 증거를 아래 순서로 기록합니다. 요약만 적지 않고 exact value와 원문 결과를 함께 제공합니다.

## Revision identity

- Repository: 실제 `owner/repository`
- Starting base SHA: 작업계약의 exact base와 실제 시작 SHA
- Starting branch/head: 시작 branch와 40자리 HEAD
- Final branch/head: 최종 branch와 40자리 HEAD
- Parent chain: base에서 final HEAD까지 순서
- Commit list: SHA와 commit message

## Change evidence

- Changed files: repository-relative 전체 목록
- Diff stats: files changed, insertions, deletions
- Implementation summary: 요구사항별 실제 구현
- Scope compliance: allowed/forbidden 경로 대조와 unrelated change 여부

## Automated verification

- Tests executed: test file, test count, passed/failed/skipped
- Exact command outputs: command, exit code, 핵심 원문
- CI run/job/steps/log: run ID, job ID, step conclusion, log retrieval 결과
- Cloudflare result: deployment ID, status, deployment commit, preview URL

## Delivery state

- Known limitations: 현재 HEAD의 실제 제약
- Local validation still required: 필요한 실환경 검증과 이유
- Draft PR state: PR 번호, OPEN 여부, Draft 여부, base/head
- Remaining blockers: 차단 사유, 해제 주체, 다음 전이

## Required closing line

보고서 마지막 줄은 다음 중 하나만 사용합니다.

`READY FOR CTO RE-REVIEW — DO NOT MERGE`

`BLOCKED — DO NOT MERGE`

웹 개발자는 `READY`, merge 승인, production 검증 완료를 단독 판정하지 않습니다.
