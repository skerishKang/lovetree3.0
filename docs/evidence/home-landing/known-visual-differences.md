# LT3-HOME-001 — 홈 랜딩 시각 차이

## Screen ID
**LT3-HOME-001** — Route: `/`

## Reference
- Path: `docs/reference/screens/00-home/home-landing.png`
- Resolution: 2752×1536
- SHA-256: `61ae29a8f52ff528d263ebde0903d5eca7ab567ee6e8f54069b234a24541b641`

## Refinement 기준
- 기준 main SHA: `a4dcb28124553ecf05662f2dce0382d5811eb160`
- 수정 전(PR #1 기준) pixel-diff (MAE): **8.37%**
- 수정 후 pixel-diff (MAE): **7.65%**
- 상대 개선율: **8.5%** (목표 10%에 미달)

## 개선한 항목

1. **배경색 정밀 보정**
   - 좌측 핑크: `#dcbdb6` → `#daaca1` (reference 실제 측정값)
   - 우측 세이지: `#95a596` → `#88998d` (reference 실제 측정값)
   - 패널 표면: `#fcf9f0` → `#f7f3e8` (reference median)
   - 곡선형 면: `#95a596` → `#dadcd0` (semi-transparent cream overlay)
   - 별 장식: `rgba(255,255,255,0.55)` → `rgba(252,250,230,0.65)`

2. **타이포그래피 확대**
   - 헤드라인: `2.4vw` → `2.5vw`, line-height `1.08` → `1.05`
   - 설명문: 상한 `1.6rem` → `1.8rem`
   - 버튼 텍스트: 상한 `1.15rem` → `1.2rem`
   - 메뉴: 상한 `1.25rem` → `1.35rem`
   - 기능 제목: 상한 `1.75rem` → `1.8rem`

3. **버튼 시각 개선**
   - border-radius: `12px` → `20px` (pill shape에 근접)
   - 높이: 상한 `3.5rem(56px)` → `4.25rem(68px)`

## 아직 남은 차이

1. **폰트 렌더링**: reference PNG의 폰트 안티앨리어싱과 브라우저 렌더링이 본질적으로 다름. 동일한 폰트 스택이라도 OS/브라우저에 따라 미세 차이 발생
2. **SVG vs Raster**: 카드 트리 연결선과 같은 SVG 요소는 reference의 rasterized 표현과 정확히 일치할 수 없음
3. **그래디언트 각도**: reference의 배경 전환이 CSS linear-gradient로 완전히 재현되지 않음 (reference는 105° 각도에 55%/75% stop)
4. **패널 border-radius**: reference의 radius와 exact 일치 확인 불가 (vision 추정치 기반)
5. **내부 레이아웃 세부**: CTA 버튼 위치, 기능 영역 간격 등이 reference와 미세하게 다름

## 생성형 reference 특성
이 reference PNG는 Figma/Sketch 등 디자인 도구에서 추출된 raster 이미지입니다. CSS로 구현된 브라우저 렌더링과 완전히 동일하게 만들 수 없는 요소가 포함됩니다:
- 폰트 힌팅 및 서브픽셀 렌더링 차이
- CSS 그라디언트와 디자인 도구 그라디언트의 디더링 차이
- SVG 렌더링과 래스터화된 형태의 차이

## Mobile 반응형 해석
- 390px viewport에서 단일 컬럼 레이아웃으로 전환
- 헤더: 로고 위, 메뉴 아래 (stacked)
- 히어로: 1컬럼 (copy 위, tree preview 아래)
- CTA: full width 버튼
- 기능: 2컬럼 → 1컬럼 (480px 미만)

## API·Firebase·navigation
모두 미연결. 정적 UI-only 구현.

## 후속 refinement 후보
- Priority 1: 추가 pixel-diff 전수 측정으로 정밀도 향상
- Priority 2: 각 요소별 위치 오차를 px 단위로 측정하여 개별 보정
- VISUAL refinement 확장: LT3-COMMUNITY-001, LT3-TREE-DETAIL-001 등
