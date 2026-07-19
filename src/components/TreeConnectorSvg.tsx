import type { CSSProperties } from "react";
import type { SVGProps } from "react";

interface TreeConnectorSvgProps extends SVGProps<SVGSVGElement> {}

/**
 * 러브트리 카드 간 연결선 SVG
 *
 * 장밋빛 곡선 (stroke: var(--accent-rose))
 * viewBox: 0 0 100 100 (percentage 기준, preserveAspectRatio none)
 *
 * 카드 위치 (mockData.ts 보정값 기준 %):
 *   mem-001: top 58%, left 8%  (왼쪽 시작)
 *   mem-002: top 12%, left 36% (중앙 상단)
 *   mem-003: top 72%, left 40% (중앙 하단)
 *   mem-004: top 4%,  left 68% (상단 오른쪽)
 *   mem-005: top 66%, left 72% (하단 오른쪽)
 */
export default function TreeConnectorSvg({ className, ...rest }: TreeConnectorSvgProps) {
  const stroke = "var(--accent-rose)";
  const strokeWidth = 0.35;
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
      {/* mem-001(8,58) → mem-002(36,12) : 왼쪽 시작 → 중앙 상단 */}
      <path
        d="M 14 58 C 22 44, 28 18, 36 12"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* mem-001(8,58) → mem-003(40,72) : 왼쪽 시작 → 중앙 하단 */}
      <path
        d="M 14 58 C 24 64, 32 70, 40 72"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* mem-002(36,12) → mem-004(68,4) : 중앙 상단 → 상단 오른쪽 */}
      <path
        d="M 36 12 C 48 6, 58 2, 68 4"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* mem-003(40,72) → mem-005(72,66) : 중앙 하단 → 하단 오른쪽 */}
      <path
        d="M 40 72 C 52 70, 62 67, 72 66"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* mem-002(36,12) → mem-005(72,66) : 교차 연결 */}
      <path
        d="M 36 12 C 52 28, 62 50, 72 66"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={0.8}
      />
    </svg>
  );
}
