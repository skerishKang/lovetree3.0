# Known Visual Differences — LT3-HOME-001

## Screen Identification

| Field | Value |
|---|---|
| Screen ID | LT3-HOME-001 |
| Route | `/` |
| 기준 main SHA | `a4dcb28124553ecf05662f2dce0382d5811eb160` |
| reference path | `docs/reference/screens/00-home/home-landing.png` |
| reference resolution | 2752 × 1536 |
| reference SHA-256 | `61ae29a8f52ff528d263ebde0903d5eca7ab567ee6e8f54069b234a24541b641` |

## Reference Characteristic

사용자가 제공한 raster Reference PNG입니다. 정확한 원본 제작 도구는 확인되지 않았으므로 특정 도구를 Figma 또는 Sketch로 단정하지 않습니다.

## 개선한 항목

1. 배경색 정밀 보정 (reference 실제 측정값, `--page-pink #daaca1`, `--page-sage #88998d`)
2. 메인 패널 표면색 보정 (`--surface-main #f7f3e8`)
3. 곡선형 면 색상/투명도 보정 (`--page-curve-green #dadcd0`, opacity 0.4)
4. 헤드라인 font-size/line-height 조정 (2.5vw, 1.05)
5. 버튼 pill shape radius (20px) 및 높이 증가 (4.25rem)
6. 패널 좌우 margin reference 정확 일치 (13.8vw)
7. 패널 상단 border-radius 32px
8. 카피/트리/기능 영역 간격 조정
9. 모든 홈 전용 CSS scoped to `.container`

## 아직 남은 차이

1. **폰트 렌더링**: Reference PNG의 rasterized 폰트와 브라우저의 서브픽셀 렌더링 차이.
   CSS `-webkit-font-smoothing: antialiased`로 완화했으나 불가피한 차이가 남음.
2. **SVG vs Raster 표현**: 기억 카드 및 연결선이 SVG로 구현됨. Reference는 raster 이미지.
   SVG의 sub-pixel 위치와 anti-aliasing이 raster 표현과 일치하지 않음.
3. **CSS gradient vs Reference gradient**: `linear-gradient`의 디더링 패턴이
   Reference raster gradient와 구조적으로 다름. SVG `linearGradient` 또는
   실제 배경 이미지가 없는 한 해결 불가.
4. **패널 내부 요소 미세 정렬**: 헤더 로고, CTA 버튼, 기능 아이콘의 개별 좌표가
   Reference와 수 px 차이. 이는 Reference의 제작 좌표를 정확히 알 수 없어
   CSS vw/vh 기반 추정에 의존한 결과.
5. **카드 트리 미리보기**: 5개 카드의 좌표·회전·깊이감이 SVG transform으로
   구현되어 Reference의 raster 표현과 미묘한 차이.

## 생성형 Reference 특성상 완전히 동일하게 만들기 어려운 요소

- Reference PNG의 제작 도구(Figma Sketch 등)가 출력하는 pixel grid와
  브라우저 렌더링 엔진(Chromium)의 출력 pixel grid가 구조적으로 다름
- Font-family가 동일하더라도 rasterization 방식(font-hinting, anti-aliasing,
  subpixel rendering)이 브라우저와 디자인 도구 간 차이
- Gradient dithering 및 blend mode의 수학적 구현 차이

## Mobile 반응형 해석

390×844 viewport에서 모든 요소가 정상 표시되며 가로 overflow가 없습니다.
모바일에서는 단일 column flex 레이아웃으로 전환되며,
제목·설명·CTA·기능 영역이 하단까지 순서대로 배치됩니다.

## API / Firebase / Navigation 미연결

이 화면은 정적 UI BASE 단계입니다.

- CTA controls는 `<button type="button">`을 사용합니다.
- 헤더 메뉴 4개는 `<a href="#">`로 렌더링됩니다.
- 헤더 anchor의 `onClick`에서 `preventDefault()`를 호출하므로 실제 route 이동이나 URL 변경은 발생하지 않습니다.
- 실제 API 호출, Firebase 인증, localStorage 또는 sessionStorage 접근은 없습니다.

## 후속 Refinement 후보

1. SVG 카드 트리를 Reference raster 좌표에 더 정확히 맞추기
2. CSS gradient를 SVG gradient 또는 base64 이미지로 대체
3. Pretendard Variable 폰트의 실제 woff2 파일을 프로젝트에 포함하여
   브라우저 렌더링 일관성 확보 (font-face 선언 필요)
4. Reference의 실제 제작 좌표(px 단위)가 확보되면 CSS vw/vh를 px로 대체하여
   미세 정렬 개선

**VISUAL refinement 범위**: CSS-only, 정적 구조, 카피·요소 수 불변.
