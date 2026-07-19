# LoveTree 3.0 Screen Reference Inventory

이 문서는 LoveTree 3.0 화면 기준 이미지(reference screen)의 인벤토리입니다.
모든 이미지는 **프런트엔드 구현의 기준 자료**이며 production asset이 아닙니다.
이미지 내용은 재인코딩하거나 압축하지 않았습니다. SHA-256은 파일 이동 전후 동일함을 확인한 값입니다.

## 화면 목록

### LT3-HOME-001 — 홈 랜딩

| 항목 | 값 |
|---|---|
| Screen ID | LT3-HOME-001 |
| 화면 이름 | 홈 랜딩 |
| 정리된 파일 경로 | `docs/reference/screens/00-home/home-landing.png` |
| 원래 파일명 | `home-landing.png` |
| 픽셀 해상도 | 2752 × 1536 |
| 파일 크기 | 6,817,798 bytes (6.50 MB) |
| SHA-256 | `61ae29a8f52ff528d263ebde0903d5eca7ab567ee6e8f54069b234a24541b641` |
| Desktop/Mobile | Desktop |
| 로그인 전/후 | 로그인 전 (랜딩 화면) |
| 구현 상태 | STATIC_IMPLEMENTED |
| API 상태 | NOT_CONNECTED |
| 관련 API 예상 | `/api/community/trees`(공개 트리 미리보기), `/api/auth`(My Tree 진입 시) |
| 확정 사항 | 파스텔 배경, 아이보리 패널, 헤더(Relovetree), 메뉴 4개, 히어로 카피 2줄, CTA 버튼 2개, 기억 카드 5개, 곡선 연결선, 하단 기능 4개 |
| 추론 사항 | 카드 크기 차이는 단계/깊이감 표현으로 추정 |
| 미확정 사항 | `Relovetree` 표기가 최종 브랜드명인지 임시 명칭인지 미확정, 로고 클릭 동작 미확정 |

---

### LT3-COMMUNITY-001 — 커뮤니티 탐색

| 항목 | 값 |
|---|---|
| Screen ID | LT3-COMMUNITY-001 |
| 화면 이름 | 커뮤니티 탐색 (Community Discovery) |
| 정리된 파일 경로 | `docs/reference/screens/01-community/community-discovery.png` |
| 원래 파일명 | `community-discovery.png` |
| 픽셀 해상도 | 2752 × 1536 |
| 파일 크기 | 6,886,299 bytes (6.56 MB) |
| SHA-256 | `8d54dcd05d95196248658008ab5ba630d4538f66c61945bbff13034183229b2b` |
| Desktop/Mobile | Desktop |
| 로그인 전/후 | 불명확 (로그인 전후 모두 접근 가능한 공개 탐색 화면으로 추정) |
| 구현 상태 | NOT_IMPLEMENTED |
| API 상태 | NOT_CONNECTED |
| 관련 API 예상 | `/api/community/trees`, `/api/community/search`, 카테고리 필터 API |
| 확정 사항 | 헤더(검색창, 카테고리 메뉴 6개), "다른 팬들의 러브트리 구경하기" 타이틀, 그리드 카드, Featured LoveTree 중앙 강조 카드 |
| 추론 사항 | 카드에 좋아요/댓글/태그 포함, 소셜 미디어적 상호작용 기능 추정 |
| 미확정 사항 | 검색 필터 동작, 카테고리 메뉴 정확한 동작, Featured 선정 기준 |

---

### LT3-TREE-DETAIL-001 — 트리 상세/타임라인

| 항목 | 값 |
|---|---|
| Screen ID | LT3-TREE-DETAIL-001 |
| 화면 이름 | 트리 상세/타임라인 (Community Tree Detail) |
| 정리된 파일 경로 | `docs/reference/screens/02-tree-detail/community-tree-detail-desktop.png` |
| 원래 파일명 | `Gemini_Generated_Image_1rhbby1rhbby1rhb.png` |
| 픽셀 해상도 | 2752 × 1536 |
| 파일 크기 | 7,816,790 bytes (7.45 MB) |
| SHA-256 | `f6dc905a48cdbcca1677307262d2223bbef7197ad3e621bc63d69738adb768a6` |
| Desktop/Mobile | Desktop |
| 로그인 전/후 | 로그인 후 (댓글 입력창 활성화, 사용자 프로필 표시) |
| 구현 상태 | NOT_IMPLEMENTED |
| API 상태 | NOT_CONNECTED |
| 관련 API 예상 | `/api/trees/:id`, `/api/trees/:id/memories`, `/api/trees/:id/comments`, `/api/trees/:id/likes` |
| 확정 사항 | 좌측 타임라인 시각화(폴라로이드 카드 연결), 우측 사이드바(좋아요, 댓글, 공유, 내 러브트리에 저장), 댓글 입력 |
| 추론 사항 | 트리 저장(복제) 기능 추정, 공개 트리 조회 화면 |
| 미확정 사항 | 타임라인 정렬 기준, 트리 저장 동작 방식, 공유 채널 |

---

### LT3-MEMORY-001 — 메모리 연결

| 항목 | 값 |
|---|---|
| Screen ID | LT3-MEMORY-001 |
| 화면 이름 | 메모리 연결 (Memory Connect) |
| 정리된 파일 경로 | `docs/reference/screens/03-memory/memory-connect-mobile.png` |
| 원래 파일명 | `Gemini_Generated_Image_2bhjmy2bhjmy2bhj.png` |
| 픽셀 해상도 | 1536 × 2752 |
| 파일 크기 | 6,617,074 bytes (6.31 MB) |
| SHA-256 | `dac6ad78a14cfc91bab5de19debc13e8eba7a8506e3e7ed73003ea84ce74a2da` |
| Desktop/Mobile | Mobile |
| 로그인 전/후 | 로그인 후 |
| 구현 상태 | NOT_IMPLEMENTED |
| API 상태 | NOT_CONNECTED |
| 관련 API 예상 | `/api/trees/:id/memories`, `POST /api/trees/:id/memories/:parentId/connect` |
| 확정 사항 | "어느 순간과 연결할까요?" 타이틀, 트리 구조 시각화, "이 순간 뒤에 연결하기" CTA |
| 추론 사항 | 새 메모리를 기존 트리 특정 위치에 연결하는 흐름 |
| 미확정 사항 | 연결 순서(뒤/앞) 기준, 다중 연결 허용 여부 |

---

### LT3-MEMORY-002 — 메모리 상세

| 항목 | 값 |
|---|---|
| Screen ID | LT3-MEMORY-002 |
| 화면 이름 | 메모리 상세 (Memory Detail) |
| 정리된 파일 경로 | `docs/reference/screens/03-memory/memory-detail-mobile.png` |
| 원래 파일명 | `Gemini_Generated_Image_iccib8iccib8icci.png` |
| 픽셀 해상도 | 2816 × 1536 (모바일 프레임 2개 가로 배치 시안) |
| 파일 크기 | 5,979,658 bytes (5.70 MB) |
| SHA-256 | `ab0d3668d3bf8c2dfd2a533e40d8eb952ad8b451d5ea64024c467d6a23e1da3e` |
| Desktop/Mobile | Mobile (2프레임 시안) |
| 로그인 전/후 | 로그인 후 (수정 버튼 활성화, 본인 메모리) |
| 구현 상태 | NOT_IMPLEMENTED |
| API 상태 | NOT_CONNECTED |
| 관련 API 예상 | `/api/memories/:id`, `/api/memories/:id/related`, 좋아요/댓글/공유 API |
| 확정 사항 | 미디어 영역(재생 버튼), 타이틀, 날짜, 태그 3개, 메모 본문, "이 순간과 이어진 기억" 연관 카드, 하단 탭(좋아요, 댓글, 공유, 수정) |
| 추론 사항 | 연관 메모리 가로 스크롤, 좋아요 수 표시 |
| 미확정 사항 | 영상 재생 방식, 수정 화면 전환, 공유 채널 |

---

### LT3-MEDIA-001 — 미디어 검색

| 항목 | 값 |
|---|---|
| Screen ID | LT3-MEDIA-001 |
| 화면 이름 | 미디어 검색 (Media Search) |
| 정리된 파일 경로 | `docs/reference/screens/04-media-search/media-search-mobile.png` |
| 원래 파일명 | `Gemini_Generated_Image_ccgaynccgaynccga.png` |
| 픽셀 해상도 | 2816 × 1536 (모바일 프레임 시안) |
| 파일 크기 | 7,011,306 bytes (6.68 MB) |
| SHA-256 | `9634f8b428ade2de19bd911ad88d3759965cc94a26bef8569f0cab04760f3fb5` |
| Desktop/Mobile | Mobile |
| 로그인 전/후 | 로그인 후 ("러브트리에 추가" 기능) |
| 구현 상태 | NOT_IMPLEMENTED |
| API 상태 | NOT_CONNECTED |
| 관련 API 예상 | `/api/media/search`, `/api/trees/:id/memories`(미디어 추가), 외부 영상 링크 크롤링 |
| 확정 사항 | 검색창("무대, 직캠, 영상 링크 검색"), 검색 결과 카드(썸네일, 제목, 날짜, 채널명), "러브트리에 추가" 버튼, 하단 카테고리 필터(무대, 직캠, 컴백, 콘서트) |
| 추론 사항 | 외부 영상 링크 검색 지원 |
| 미확정 사항 | 검색 소스(YouTube 등), 필터 다중 선택 여부, 추가 시 트리 선택 UI |

---

### LT3-EDITOR-001 — 빈 트리 에디터/초기화

| 항목 | 값 |
|---|---|
| Screen ID | LT3-EDITOR-001 |
| 화면 이름 | 빈 트리 에디터/초기화 (Empty Tree Editor) |
| 정리된 파일 경로 | `docs/reference/screens/05-editor/empty-tree-desktop.png` |
| 원래 파일명 | `Gemini_Generated_Image_czb242czb242czb2.png` |
| 픽셀 해상도 | 2752 × 1536 |
| 파일 크기 | 6,966,889 bytes (6.64 MB) |
| SHA-256 | `a13fda6cefee5914eda12d4913bd9bbf3900f5b282b4c87fdfcf9aca579e0158` |
| Desktop/Mobile | Desktop |
| 로그인 전/후 | 로그인 후 |
| 구현 상태 | NOT_IMPLEMENTED |
| API 상태 | NOT_CONNECTED |
| 관련 API 예상 | `POST /api/trees`, `POST /api/trees/:id/memories` |
| 확정 사항 | 좌측 사이드바(내 러브트리, 탐색, 설정), "새 러브트리" 타이틀, "첫 순간을 추가해 러브트리를 시작하세요" 안내, "첫 순간 추가" CTA |
| 추론 사항 | 트리 생성 직후 온보딩 단계 |
| 미확정 사항 | 사이드바 "패의 보기" 메뉴 정확한 명칭/기능 (이미지 판독 불확실) |

---

### LT3-EDITOR-002 — 트리 에디터 캔버스

| 항목 | 값 |
|---|---|
| Screen ID | LT3-EDITOR-002 |
| 화면 이름 | 트리 에디터 캔버스 (Tree Editor Canvas) |
| 정리된 파일 경로 | `docs/reference/screens/05-editor/tree-editor-desktop.png` |
| 원래 파일명 | `Gemini_Generated_Image_oxn2uioxn2uioxn2.png` |
| 픽셀 해상도 | 2752 × 1536 |
| 파일 크기 | 6,914,286 bytes (6.59 MB) |
| SHA-256 | `c29ec6a5c2954999cd171dde8fa39a63a3644ce5fdaeac69c7fc8aacb7b9208b` |
| Desktop/Mobile | Desktop |
| 로그인 전/후 | 로그인 후 |
| 구현 상태 | NOT_IMPLEMENTED |
| API 상태 | NOT_CONNECTED |
| 관련 API 예상 | `/api/trees/:id/memories`, `/api/trees/:id/connections`, `PATCH /api/memories/:id` |
| 확정 사항 | 좌측 사이드바(홈, 내 러브트리, 설정, 새 러브트리 만들기), 중앙 캔버스(마인드맵 형태 메모리 시각화), 메모리 검색/추가, 우측 상세 패널(비디오, 날짜, 태그, 메모, 연결 설정) |
| 추론 사항 | 캔버스 기반 자유 배치 에디터, 드래그로 메모리 연결 |
| 미확정 사항 | 캔버스 좌표 저장 방식, 연결선 자동/수동 여부, 미디어 연결 토글 정확한 동작 |

---

### LT3-MY-TREES-001 — 마이 트리 대시보드

| 항목 | 값 |
|---|---|
| Screen ID | LT3-MY-TREES-001 |
| 화면 이름 | 마이 트리 대시보드 (My Trees Dashboard) |
| 정리된 파일 경로 | `docs/reference/screens/06-my-trees/my-trees-dashboard-desktop.png` |
| 원래 파일명 | `my-trees-dashboard.png` |
| 픽셀 해상도 | 2816 × 1536 |
| 파일 크기 | 6,539,866 bytes (6.23 MB) |
| SHA-256 | `df3893253f2b1289a99b78245c7d8700ead7ba9cde4e584742134f306ea07814` |
| Desktop/Mobile | Desktop |
| 로그인 전/후 | 로그인 후 (사용자 프로필, 개인화된 데이터) |
| 구현 상태 | NOT_IMPLEMENTED |
| API 상태 | NOT_CONNECTED |
| 관련 API 예상 | `GET /api/users/me/trees`, `POST /api/trees`, `DELETE /api/trees/:id` |
| 확정 사항 | "나의 러브트리" 헤더, "새 러브트리 만들기" 버튼, 그리드 카드(제목, 공개 범위, 수정일, 순간 개수), 카드 액션(편집, 공유, 등록, 삭제), 우측 "최근 수정한 순간" 섹션 |
| 추론 사항 | 카드 "등록" 아이콘은 복제/복사 기능 추정 |
| 미확정 사항 | "등록" 아이콘 정확한 기능, 페이지네이션, 정렬 옵션 |

---

### LT3-MY-TREES-002 — 마이 트리 빈 상태

| 항목 | 값 |
|---|---|
| Screen ID | LT3-MY-TREES-002 |
| 화면 이름 | 마이 트리 빈 상태 (My Trees Empty State) |
| 정리된 파일 경로 | `docs/reference/screens/06-my-trees/my-trees-empty-mobile.png` |
| 원래 파일명 | `Gemini_Generated_Image_s9gefws9gefws9ge.png` |
| 픽셀 해상도 | 2816 × 1536 (모바일 프레임 시안) |
| 파일 크기 | 6,553,489 bytes (6.24 MB) |
| SHA-256 | `2ff499f5d5a7dca3d922bb856aa2f72f4bd5cec0383a06c1b2601e7f2308b1a2` |
| Desktop/Mobile | Mobile |
| 로그인 전/후 | 로그인 후 (사용자 아이콘) |
| 구현 상태 | NOT_IMPLEMENTED |
| API 상태 | NOT_CONNECTED |
| 관련 API 예상 | `GET /api/users/me/trees`(빈 응답), `POST /api/trees` |
| 확정 사항 | "아직 러브트리가 없어요" 안내, "처음 좋아하게 된 순간부터 하나씩 이어보세요", "첫 순간 기록하기" CTA, "예시 러브트리 보기" 링크, 태그 버튼(입덕, 첫 콘서트, 최애 무대) |
| 추론 사항 | 온보딩 empty state, 태그 버튼은 빠른 시작 템플릿 추정 |
| 미확정 사항 | "예시 러브트리 보기" 연결 대상, 태그 버튼 클릭 시 동작 |

---

### LT3-SETTINGS-001 — 공개 범위 설정

| 항목 | 값 |
|---|---|
| Screen ID | LT3-SETTINGS-001 |
| 화면 이름 | 공개 범위 설정 (Visibility Settings) |
| 정리된 파일 경로 | `docs/reference/screens/07-settings/visibility-settings-mobile.png` |
| 원래 파일명 | `Gemini_Generated_Image_svgkh8svgkh8svgk.png` |
| 픽셀 해상도 | 2816 × 1536 (모바일 프레임 다중 시안) |
| 파일 크기 | 7,047,746 bytes (6.72 MB) |
| SHA-256 | `9b0af956f31d02e0d88e27236e5f8a2c80ecd310add6e4f2851c567845e42f29` |
| Desktop/Mobile | Mobile |
| 로그인 전/후 | 로그인 후 (본인 트리 관리) |
| 구현 상태 | NOT_IMPLEMENTED |
| API 상태 | NOT_CONNECTED |
| 관련 API 예상 | `PATCH /api/trees/:id`(visibility 필드), `POST /api/trees/:id/share-link` |
| 확정 사항 | "공개 범위 설정" 타이틀, 3가지 옵션(나만 보기, 링크를 가진 사람만, 커뮤니티에 공개), 추가 토글(댓글 허용, 좋아요 허용, 프로필 표시 이름 공개), Copy Link 버튼, 저장/완료 버튼 |
| 추론 사항 | 링크 공유 시 별도 share link 생성 |
| 미확정 사항 | 링크 만료 정책, 커뮤니티 공개 시 검색 노출 범위 |

---

### LT3-AUTH-001 — 로그인/마이페이지

| 항목 | 값 |
|---|---|
| Screen ID | LT3-AUTH-001 |
| 화면 이름 | 로그인 유도/마이페이지 (Login / My Page) |
| 정리된 파일 경로 | `docs/reference/screens/08-auth/login-my-page-mobile.png` |
| 원래 파일명 | `login-my-page.png` |
| 픽셀 해상도 | 768 × 1376 |
| 파일 크기 | 1,189,205 bytes (1.13 MB) |
| SHA-256 | `597fe871c22745213d4bd7cc65c2035b743dcd1c69661bd52f2e71c18733ea1b` |
| Desktop/Mobile | Mobile |
| 로그인 전/후 | 로그인 전 (로그인 유도 화면) |
| 구현 상태 | NOT_IMPLEMENTED |
| API 상태 | NOT_CONNECTED |
| 관련 API 예상 | Firebase Auth(Google, Email), `/api/auth/session` |
| 확정 사항 | "내 러브트리를 계속 이어가려면 로그인하세요" 안내, 구글 계정으로 계속하기 버튼, 이메일로 로그인 버튼, 프로필 카드(테스트 러버 A), 로그인 혜택 안내(기록 저장, 공유 관리, 댓글 알림, 내 트리 동기화) |
| 추론 사항 | 익명 사용자 데이터를 로그인 후 이어받는 흐름 |
| 미확정 사항 | "표 꽂 유지 프로일하기" 문구 판독 불확실(오타 추정), 이메일 회원가입 별도 화면 존재 여부 |

---

## 요약

| 항목 | 값 |
|---|---|
| 총 화면 수 | 12 |
| 구현 완료 | 1 (LT3-HOME-001) |
| 미구현 | 11 |
| 총 이미지 크기 | 약 72.6 MB |
| 최대 단일 이미지 | 7.45 MB (LT3-TREE-DETAIL-001) |
| 50MB 초과 파일 | 없음 |
| 100MB 초과 파일 | 없음 |

## 비고

- 모든 이미지는 Gemini 기반 생성 시안 또는 사용자 제공 기준 자료입니다.
- 작은 한글 텍스트는 원본 해상도에서도 일부 판독이 불확실합니다. 불확실한 문구를 원문으로 단정하지 마세요.
- 화면 ID의 숫자 접미사(001, 002)는 동일 화면군 내 변형(Desktop/Mobile, 빈 상태/데이터 있음)을 구분합니다.
- 이 인벤토리는 구현 진행에 따라 업데이트됩니다.
