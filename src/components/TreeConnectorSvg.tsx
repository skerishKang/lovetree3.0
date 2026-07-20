import type { CSSProperties } from "react";
import type { SVGProps } from "react";

interface TreeConnectorSvgProps extends SVGProps<SVGSVGElement> {}

/**
 * 러브트리 카드 간 연결선 SVG
 *
 * 장밋빛 곡선 (stroke: var(--accent-rose))
 * viewBox: 0 0 100 100 (percentage 기준, preserveAspectRatio none)
 *
 * 2차 보정: 박사님 anchor 기준 카드 위치 (%):
 *   mem-001: top 68%, left 4%  (좌측 시작)
 *   mem-002: top 34%, left 43% (중앙 상단)
 *   mem-003: top 95%, left 43% (중앙 하단)
 *   mem-004: top 20%, left 88% (우측 상단)
 *   mem-005: top 95%, left 88% (우측 하단)
 *
 * 연결 구조 (원본 기준, S자 곡선 + 수직선):
 *   mem-001 → mem-002 (시작 → 중앙 상단): 우상향 곡선
 *   mem-001 → mem-003 (시작 → 중앙 하단): 우하향 곡선
 *   mem-002 → mem-004 (중앙 상단 → 우측 상단): 우상향 곡선
 *   mem-003 → mem-005 (중앙 하단 → 우측 하단): 수평 곡선
 *   mem-002 → mem-005 (중앙 상단 → 우측 하단): S자 곡선
 */
export default function TreeConnectorSvg({ className, ...rest }: TreeConnectorSvgProps) {
  const stroke = "var(--accent-rose)";
  const strokeWidth = 0.4;
  const style: CSSProperties = { overflow: "visible" };

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      {/* mem-001(4,68) → mem-002(43,34) : 시작 → 중앙 상단 (우상향 곡선) */}
      <path
        d="M 8 68 C 20 60, 30 40, 43 34"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* mem-001(4,68) → mem-003(43,95) : 시작 → 중앙 하단 (우하향 곡선) */}
      <path
        d="M 8 68 C 20 78, 32 90, 43 95"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* mem-002(43,34) → mem-004(88,20) : 중앙 상단 → 우측 상단 (우상향 곡선) */}
      <path
        d="M 47 34 C 60 28, 75 22, 88 20"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* mem-003(43,95) → mem-005(88,95) : 중앙 하단 → 우측 하단 (수평 곡선) */}
      <path
        d="M 47 95 C 60 95, 75 95, 88 95"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* mem-002(43,34) → mem-005(88,95) : 중앙 상단 → 우측 하단 (S자 곡선) */}
      <path
        d="M 47 34 C 65 50, 75 75, 88 95"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={0.8}
      />
    </svg>
  );
}
