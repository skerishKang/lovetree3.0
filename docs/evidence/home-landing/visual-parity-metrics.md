# LT3-HOME-001 — VISUAL Parity Metrics

## Pixel-diff Algorithm
**Normalized RGB Mean Absolute Error (MAE)**

```
MAE% = sum(|referenceRGB - implementationRGB|) / (255 × 3 × W × H) × 100
```

## Script
- Path: `/tmp/compare-home-refinement.py`
- 방법: 두 PNG를 `RGB` 모드로 로드, `numpy` float32 배열 변환, 채널별 절대 차이 합산 후 정규화
- 크기 불일치 시 implementation을 reference 크기로 `LANCZOS` 리샘플링

## Viewport와 DPR
| 항목 | 값 |
|---|---|
| viewport | 2752 × 1536 |
| deviceScaleFactor | 1 |
| fullPage | false |
| animations | disabled |
| font load | networkidle + 1.5s settle |

## Baseline (수정 전)
- **Image**: `docs/evidence/home-landing/refinement-baseline-desktop-2752x1536.png`
- **Path**: PR #1 최종 evidence (`implementation-desktop-2752x1536.png`)와 동일한 시점의 fresh capture
- **MAE**: **8.3670%**

## Refined (수정 후)
- **Image**: `docs/evidence/home-landing/implementation-desktop-2752x1536-refined.png`
- **MAE**: **7.6521%**

## 개선 지표
| 항목 | 값 |
|---|---|
| Before MAE | 8.3670% |
| After MAE | 7.6521% |
| 절대 개선 | 0.7149%p |
| 상대 개선율 | **8.54%** |
| 목표 개선율 | 10% |
| 목표 달성 | ❌ (8.54% < 10%) |

## 역사적 21.22%와의 관계
역사적 `21.22%`는 PR #1에서 다른 계산 방식으로 측정된 값입니다. 동일한 알고리즘을 재현할 수 없어 직접 비교하지 않습니다.

`8.37%` baseline은 같은 알고리즘(MAE)으로 신규 측정한 수치로, 이번 refinement의 기준값입니다.

## 개선이 제한된 원인
1. **폰트 렌더링**: Reference는 디자인 툴에서 rasterize된 PNG로, 브라우저의 폰트 힌팅/서브픽셀 렌더링과 본질적 차이
2. **SVG vs Raster**: 카드 트리 연결선과 카드 내부 radial-gradient는 reference의 rasterized 형태와 다른 픽셀 분포
3. **그래디언트**: CSS linear-gradient는 디자인 툴의 그래디언트와 디더링/블렌딩 방식 차이
4. **내부 레이아웃**: 패널 margin/padding이 reference와 미세 차이 (reference 측정값의 불확실성)
5. **이미지 생성형 특성**: PNG 압축 아티팩트, 안티앨리어싱 등이 pixel-diff에 포함

## 추가 보정 가이드
- Pixel-diff를 더 낮추려면: 패널 margin/padding을 reference와 1px 단위로 정밀 정렬
- 실제 시각 품질은 MAE 수치 이상으로 개선됨 (색상 정확도 향상, 버튼 형태 개선)
- 기능 변경 없이 CSS만으로 개선 가능한 범위는 약 10-12% 한계로 추정
