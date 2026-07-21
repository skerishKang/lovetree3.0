# LT3-SETTINGS-001 — 공개 범위 설정 UI BASE

## 기준 이미지

| 항목 | 값 |
|---|---|
| 파일 | `docs/reference/screens/07-settings/visibility-settings-mobile.png` |
| 해상도 | 2816 × 1536px |
| SHA-256 | `9b0af956f31d02e0d88e27236e5f8a2c80ecd310add6e4f2851c567845e42f29` |

## 선택한 프레임과 초기 상태

기준 이미지는 하나의 화면이 아닌 **3개 프레임**(좌측: 와이드 리스트, 중앙: 모바일 목업, 우측: 모바일 목업 변형)을 포함합니다.

**중앙 모바일 목업 프레임**을 1차 구현 기준으로 선택했습니다. 이유:
- 모든 요소(공개 범위 3개 + 추가 설정 3개 + 공유 링크 + 저장 버튼)를 하나의 화면에 모두 포함
- 다른 구현 페이지(MediaSearchPage 등)와 일관된 단일 컬럼 레이아웃
- 모바일 우선 원칙에 부합

## radial·checkbox 초기 상태

| 요소 | 초기값 | 근거 |
|---|---|---|
| 나만 보기 | **선택** | 첫 번째 radio이므로 `defaultChecked` |
| 댓글 허용 | **선택** | 기준 이미지 중앙 프레임에서 활성화 |
| 좋아요 허용 | **선택** | 기준 이미지 중앙 프레임에서 활성화 |
| 프로필 표시 이름 공개 | **해제** | 기준 이미지 중앙 프레임에서 비활성화 |
| 링크 복사 버튼 | UI-only | 실제 Clipboard API 호출 없음 |
| 저장 버튼 | UI-only | 실제 저장 없음 |

## 실제 저장·링크 생성·복사 없음

이 구현은 **UI BASE 단계**로, 다음 기능은 포함하지 않습니다:

- 실제 공개 범위 저장 (Firebase/API)
- 실제 공유 링크 생성
- Clipboard API 호출
- `localStorage`/`sessionStorage` 사용
- `fetch`/`axios` 네트워크 요청
- `onClick`/`onChange` 이벤트 핸들러
- `useState`/`useEffect` React 상태

## API·Firebase·인증 없음

모든 데이터는 정적 TypeScript 모듈(`visibilitySettingsMockData.ts`)에서 가져옵니다.
실제 사용자 ID, UID, 이메일, 토큰, 서비스 URL을 포함하지 않습니다.

## 모바일·데스크톱 해석

- **모바일 (390px)**: 단일 컬럼, 좌우 16px padding, 하단 저장 버튼
- **데스크톱 (1440px)**: 480px 이하 중앙 정렬 모바일 프레임 (기존 MediaSearchPage 등과 일관된 패턴)

## 접근성 구조

- 공개 범위: `<fieldset>` + `<legend>` "공개 범위" + `<div role="radiogroup">` + `<label>` > `<input type="radio">`
- 추가 설정: `<fieldset>` + `<legend>` "추가 설정" + `<label>` > `<input type="checkbox">`
- 공유 링크: `<input readonly>` + `<button>` 링크 복사
- 저장: `<button>` 공개 범위 저장
- 모든 버튼: `focus-visible` 스타일 적용, `cursor: default`

## VISUAL refinement 후속 항목 (이번 단계 미포함)

- SVG 아이콘의 정확한 기준 이미지 매칭
- `링크를 가진 사람만` 항목 내부의 Copy Link 버튼 위치 (현재는 별도 section에 배치)
- 토글 스위치 스타일 (checkbox 대신 iOS-style toggle)
- 화면 전환 애니메이션
- 다크 모드
- 폰트 크기·간격의 픽셀 단위 정밀 조정
