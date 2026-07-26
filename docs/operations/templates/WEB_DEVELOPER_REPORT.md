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
- Automatic Cloudflare preview: Git integration이 생성한 경우에만 deployment ID, status, commit, preview URL
- Preview not generated: 생성되지 않은 경우 그 사실만 기록하고 수동 preview를 만들지 않음

## Deployment boundary

- 웹 개발자는 production에 `wrangler pages deploy`, direct upload, dashboard retry 또는 cache purge를 실행하지 않습니다.
- 웹 개발자는 자동배포를 유발하기 위한 빈 commit, rebuild marker 또는 의미 없는 source 변경을 만들지 않습니다.
- production deployment는 사용자 승인 후 `main` merge가 Cloudflare Pages Git integration을 통해 자동으로 시작합니다.
- 자동 production deployment와 production smoke는 merge 후 웹 CTO가 확인합니다.
- 자동배포 장애가 보이면 수동 복구하지 않고 exact 상태와 metadata를 웹 CTO에게 반환합니다.

## Delivery state

- Known limitations: 현재 HEAD의 실제 제약
- Local validation still required: 필요한 실환경 검증과 이유
- Draft PR state: PR 번호, OPEN 여부, Draft 여부, base/head
- Remaining blockers: 차단 사유, 해제 주체, 다음 전이
- Manual deployment performed: 반드시 `No`; 예외가 있었다면 별도 운영사고 번호와 사용자 승인 없이는 이 보고서로 완료 처리하지 않음

## Required closing line

보고서 마지막 줄은 다음 중 하나만 사용합니다.

`READY FOR CTO RE-REVIEW — DO NOT MERGE`

`BLOCKED — DO NOT MERGE`

웹 개발자는 `READY`, merge 승인, production 검증 완료를 단독 판정하지 않습니다.
