# Visual Parity Metrics — LT3-HOME-001

## Screen Information

| Field | Value |
|---|---|
| Screen ID | LT3-HOME-001 |
| Route | `/` |
| 기준 main SHA | `a4dcb28124553ecf05662f2dce0382d5811eb160` |
| reference path | `docs/reference/screens/00-home/home-landing.png` |
| reference resolution | 2752 × 1536 |
| reference SHA-256 | `61ae29a8f52ff528d263ebde0903d5eca7ab567ee6e8f54069b234a24541b641` |

## Pixel-diff Algorithm

**Normalized RGB Mean Absolute Error (MAE)**

```
MAE% = sum(|referenceRGB - implementationRGB|) / (255 × 3 × width × height) × 100
```

### 재현 명령

```bash
# 필요 package: numpy, Pillow (Python stdlib 외)
pip install numpy Pillow
```

```python
from pathlib import Path
import numpy as np
from PIL import Image, ImageChops

REFERENCE_PATH = "docs/reference/screens/00-home/home-landing.png"
IMPLEMENTATION_PATH = "docs/evidence/home-landing/implementation-desktop-2752x1536-refined.png"
REFERENCE_SIZE = (2752, 1536)

reference = Image.open(REFERENCE_PATH).convert("RGB")
implementation = Image.open(IMPLEMENTATION_PATH).convert("RGB")

if reference.size != REFERENCE_SIZE:
    raise ValueError(f"Unexpected reference size: {reference.size}")
if implementation.size != REFERENCE_SIZE:
    raise ValueError(f"Unexpected implementation size: {implementation.size}")

reference_array = np.asarray(reference, dtype=np.float32)
implementation_array = np.asarray(implementation, dtype=np.float32)

mae_percent = (
    np.abs(reference_array - implementation_array).sum()
    / (255 * 3 * REFERENCE_SIZE[0] * REFERENCE_SIZE[1])
    * 100
)

diff = ImageChops.difference(reference, implementation)
diff.save("docs/evidence/home-landing/diff-original-vs-implementation-refined.png")

print(f"MAE: {mae_percent:.4f}%")
```

### Dimension Assertion

reference와 implementation이 모두 정확히 **2752×1536**일 때만 유효합니다.
크기가 불일치하면 리샘플링하지 않고 오류를 발생시킵니다.

## Screenshot Conditions

### Desktop (Refined)
| Parameter | Value |
|---|---|
| Viewport | 2752 × 1536 |
| Device scale factor | 1 |
| Full page | false |
| Route | `/` |
| Animations | disabled via CSS injection |
| Fonts/page | settled after `networkidle` + 2s wait |

### Mobile (Refined)
| Parameter | Value |
|---|---|
| Viewport | 390 × 844 |
| Device scale factor | 2 |
| Full page | true |
| Route | `/` |
| Animations | disabled |
| Fonts/page | settled after `networkidle` + 2s wait |

## Evidence Files

| File | Resolution |
|---|---|
| `implementation-desktop-2752x1536-refined.png` | 2752 × 1536 |
| `implementation-mobile-390x-full-refined.png` | 780 × 3584 |
| `diff-original-vs-implementation-refined.png` | 2752 × 1536 |
| `refinement-baseline-desktop-2752x1536.png` | 2752 × 1536 |
| `refinement-baseline-diff.png` | 2752 × 1536 |

## Metrics History

| Pass | MAE | Description |
|---|---|---|
| Baseline (before) | **8.3670%** | Fresh capture of current `main` at 2752×1536 |
| Pass 1 | **7.6521%** | Color/typography/button radius correction |
| **Final (Pass 2)** | **7.6393%** | + Panel geometry (margin 14.97vw→13.8vw, radius 40px→32px), hero copy gap, feature spacing |

### 개선율

| Metric | Value |
|---|---|
| Baseline MAE | 8.3670% |
| Final MAE | 7.6393% |
| Absolute improvement | 0.7277%p |
| Relative improvement | **8.70%** |
| Target (10% relative) | ❌ 미달 (1.30%p 부족) |
| Pass 1 → Final 추가 개선 | 0.0128%p |

### 역사적 21.22%와 비교

PR #1에 기록된 `21.22%`는 동일한 normalized RGB MAE 방식인지 확인할 수 없습니다.
계산 방식, viewport 크기, DPR, 캡처 조건이 동일하다는 증거가 없으므로 직접 비교하지 않습니다.

## 개선한 시각 요소 (Pass 1 + Pass 2 공통)

1. 배경색 reference 실제 측정값으로 정밀 보정 (`#daaca1`, `#88998d`, `#f7f3e8`)
2. 곡선형 면 색상 (`#dadcd0`), 투명도 (0.4)
3. 우측 하단 별 색상 (`rgba(252, 250, 230, 0.65)`)
4. 헤드라인 font-size (2.5vw), line-height (1.05)
5. 설명문 font-size (1.5vw, 상한 1.8rem)
6. 버튼 font-size (1.0vw, 상한 1.2rem)
7. 메뉴 font-size (1.1vw, 상한 1.35rem)
8. 기능 제목 font-size (1.5vw, 상한 1.8rem)
9. 버튼 border-radius pill shape (20px)
10. 버튼 높이 증가 (상한 4.25rem)
11. 패널 margin 조정 (14.97vw → 13.8vw, reference 정확히 일치)
12. 패널 border-radius (40px → 32px, .container scoped)
13. 히어로 copy gap 축소
14. 트리 미리보기 translateY 정밀 보정 (13.35vh)
15. 기능 영역 패딩/여백 축소

## 아직 남은 차이

- **폰트 렌더링**: Reference PNG는 rasterized 폰트, 브라우저는 서브픽셀 렌더링. 이 차이는 CSS만으로 해결 불가
- **SVG vs Raster**: 카드 트리 연결선 및 카드 내부 radial gradient는 SVG로 구현되어 reference의 raster 표현과 차이
- **CSS gradient vs Design gradient**: CSS linear-gradient의 디더링/stoping이 raster reference와 정확히 일치하지 않음
- **패널 내부 미세 정렬**: 헤더 로고, CTA 버튼, 기능 아이콘의 개별 좌표가 reference와 수 px 차이

## 10% 목표 미달 원인

CSS만으로 개선 가능한 범위는 color/typography/geometry 조정에 한정됩니다.
나머지 차이의 대부분은 font rasterization, SVG vs PNG 표현, gradient rendering engine 차이 등
CSS로 제어할 수 없는 브라우저 렌더링 본질에 기인합니다.

Pass 2에서 추가 geometry 보정(margin, radius, translateY, gap)이 MAE에 미친 영향은
0.0128%p로, 실질적인 개선 한계에 도달했음을 시사합니다.

## src/index.css 격리

이번 refinement에서 `src/index.css`는 origin/main 상태로 원복되었습니다.
모든 홈 전용 custom property 값은 `src/components/HomePage.module.css .container`에
스코프되어 다른 route에 영향이 없습니다.
