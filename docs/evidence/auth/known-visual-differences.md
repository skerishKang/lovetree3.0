# LT3-AUTH-001 — Known Visual Differences

**기준:** `docs/reference/screens/08-auth/login-my-page-mobile.png` (768×1376)
**구현:** `docs/evidence/auth/`

> 기준 이미지는 로그인 화면만 포함합니다.
> MyPage: reference 부재로 구현하지 않음.
> 데스크톱 로그인: 모바일 reference를 기반으로 한 반응형 확장.
> 정확한 화면 비율·간격·폰트·아이콘은 VISUAL 이관.

## 로그인 화면

| 차이 | 설명 | 처리 |
|---|---|---|
| 폰트 일치 | 기준 이미지의 Pretendard 폰트가 서버에 설치되어 있지 않아 system-ui fallback 적용 | VISUAL |
| 배경 장식 | 기준 이미지의 나무 실루엣 배경 미표현 (flat 그라데이션) | VISUAL |
| 아이콘 정밀도 | Gmail/이메일 아이콘이 유니코드 문자 사용 (SVG 미사용) | VISUAL |
| 간격 | 버튼 간격, 패딩이 기준과 수 픽셀 차이 가능 | VISUAL |
| 프로필 미리보기 | 기준 이미지의 정확한 위치·크기와 차이 가능 | VISUAL |
| 그림자 | 카드/버튼 그림자가 기준과 차이 | VISUAL |

## 전체

- pixel-perfect 정확도는 요구하지 않음 — BASE 단계
- 데스크톱 레이아웃은 기준 이미지에 없으므로 자체 반응형 적용
- 실제 인증·API·Firebase 연결 없음
