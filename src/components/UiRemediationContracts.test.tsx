import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import App from "../App";
import indexCss from "../index.css?raw";

const cssModules = import.meta.glob("./**/*.module.css", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const ROUTES = [
  "/",
  "/community",
  "/login",
  "/tree/community-demo",
  "/memory/connect-demo",
  "/my-trees",
  "/tree/edit-demo",
  "/tree/new-demo",
  "/memory/detail-demo",
  "/media/search-demo",
  "/settings/visibility-demo",
  "/my-trees/empty-demo",
];

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  render(<App />);
}

function clampBlocks(css: string): Array<{ selector: string; body: string }> {
  const blocks: Array<{ selector: string; body: string }> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    if (m[2].includes("-webkit-line-clamp")) {
      blocks.push({ selector: m[1].trim(), body: m[2] });
    }
  }
  return blocks;
}

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
});

describe("UI 리메디에이션 — clamp 규칙 완전성 계약 (D-04)", () => {
  const allCss = Object.entries(cssModules);

  it("모든 module.css가 스캔 대상에 포함된다", () => {
    expect(allCss.length).toBeGreaterThan(20);
  });

  it.each(allCss)(
    "%s의 line-clamp 규칙은 표준 쌍과 완전한 clamp 세트를 만족한다",
    (_file, css) => {
      const blocks = clampBlocks(css);
      const bySelector = new Map<string, string>();
      for (const { selector, body } of blocks) {
        expect(
          body,
          `${selector} 블록에 -webkit-line-clamp와 쌍을 이루는 표준 line-clamp가 없다`
        ).toMatch(/[{;\s]line-clamp:\s*\d+/);
        bySelector.set(selector, (bySelector.get(selector) ?? "") + body);
      }
      for (const [selector, body] of bySelector) {
        expect(body, `${selector}에 display: -webkit-box가 없다`).toMatch(
          /display:\s*-webkit-box/
        );
        expect(
          body,
          `${selector}에 -webkit-box-orient: vertical이 없다`
        ).toMatch(/-webkit-box-orient:\s*vertical/);
        expect(body, `${selector}에 overflow: hidden이 없다`).toMatch(
          /overflow:\s*hidden/
        );
        expect(body, `${selector}에 text-overflow: ellipsis가 없다`).toMatch(
          /text-overflow:\s*ellipsis/
        );
      }
    }
  );
});

describe("UI 리메디에이션 — heading 토큰 계약 (D-05)", () => {
  const tiers = ["hero", "page", "work", "compact"] as const;
  const props = ["size", "weight", "line-height"] as const;

  it.each(
    tiers.flatMap((tier) => props.map((prop) => [tier, prop] as const))
  )("index.css에 --heading-%s-%s 토큰이 정의되어 있다", (tier, prop) => {
    expect(indexCss).toMatch(
      new RegExp(`--heading-${tier}-${prop}:\\s*[^;]+;`)
    );
  });

  it("hero 헤드라인 별칭이 토큰을 가리킨다", () => {
    expect(indexCss).toMatch(/--fs-headline:\s*var\(--heading-hero-size\)/);
    expect(indexCss).toMatch(
      /--lh-headline:\s*var\(--heading-hero-line-height\)/
    );
  });

  const screenMapping: Array<[string, string]> = [
    ["./HeroSection.module.css", "--heading-hero-weight"],
    ["./CommunityTreeGrid.module.css", "--heading-page-size"],
    ["./VisibilitySettingsPage.module.css", "--heading-page-size"],
    ["./TreeDetailHeader.module.css", "--heading-work-size"],
    ["./MemoryConnectPage.module.css", "--heading-work-size"],
    ["./MyTreesPage.module.css", "--heading-work-size"],
    ["./MyTreesEmptyPage.module.css", "--heading-work-size"],
    ["./EmptyTreeEditorPage.module.css", "--heading-work-size"],
    ["./MemoryDetailPage.module.css", "--heading-compact-size"],
    ["./MediaSearchPage.module.css", "--heading-compact-size"],
    ["./TreeEditorPage.module.css", "--heading-compact-size"],
    ["./AuthBrand.module.css", "--heading-compact-size"],
  ];

  it.each(screenMapping)(
    "%s가 %s 토큰을 사용한다",
    (file, token) => {
      expect(cssModules[file] ?? "").toContain(`var(${token})`);
    }
  );
});

describe("UI 리메디에이션 — app header 토큰 계약 (D-06)", () => {
  const tokens = [
    "--app-header-bg",
    "--app-header-bg-ivory",
    "--app-header-bg-translucent",
    "--app-header-border-color",
    "--app-header-z-index",
    "--app-bar-padding-y",
    "--app-bar-height",
    "--app-bar-height-mobile",
  ];

  it.each(tokens)("index.css에 %s 토큰이 정의되어 있다", (token) => {
    expect(indexCss).toMatch(new RegExp(`${token}:\\s*[^;]+;`));
  });

  const screenMapping: Array<[string, string[]]> = [
    [
      "./MyTreesPage.module.css",
      [
        "--app-header-bg",
        "--app-header-border-color",
        "--app-bar-padding-y",
        "--app-header-z-index",
      ],
    ],
    [
      "./TreeEditorPage.module.css",
      [
        "--app-header-bg",
        "--app-header-border-color",
        "--app-bar-padding-y",
        "--app-header-z-index",
      ],
    ],
    [
      "./EmptyTreeEditorPage.module.css",
      [
        "--app-bar-height",
        "--app-bar-height-mobile",
        "--app-header-bg",
        "--app-header-border-color",
      ],
    ],
    [
      "./MemoryDetailPage.module.css",
      ["--app-header-bg-translucent", "--app-bar-padding-y", "--app-header-z-index"],
    ],
    ["./MediaSearchPage.module.css", ["--app-header-bg-ivory", "--app-header-z-index"]],
  ];

  it.each(screenMapping)(
    "%s가 header 토큰들을 사용한다",
    (file, expectedTokens) => {
      const css = cssModules[file] ?? "";
      for (const token of expectedTokens) {
        expect(css, `${file}에 var(${token})가 없다`).toContain(`var(${token})`);
      }
    }
  );
});

describe("UI 리메디에이션 — cross-screen DOM 계약", () => {
  it.each(ROUTES)("%s에 h1이 정확히 하나다 (D-05)", (route) => {
    renderAppAt(route);
    expect(document.querySelectorAll("h1")).toHaveLength(1);
  });

  it.each(ROUTES)("%s의 모든 SVG가 AT에서 숨겨진다 (D-03, D-07)", (route) => {
    renderAppAt(route);
    const svgs = Array.from(document.querySelectorAll("svg"));
    for (const svg of svgs) {
      expect(svg.getAttribute("focusable"), "svg에 focusable=false가 없다").toBe(
        "false"
      );
      const hidden =
        svg.getAttribute("aria-hidden") === "true" ||
        svg.closest("[aria-hidden='true']") !== null;
      expect(hidden, "svg가 aria-hidden 처리되지 않았다").toBe(true);
    }
  });

  it.each(ROUTES)(
    "%s에 visible 'LoveTree' 표기가 없다 (D-01)",
    (route) => {
      renderAppAt(route);
      expect(document.body.textContent ?? "").not.toMatch(/\bLove ?Tree\b/i);
    }
  );

  it("홈 메모리 프리뷰의 장식 affordance가 비인터랙티브다 (D-02)", () => {
    renderAppAt("/");
    const plays = screen.getAllByTestId("memory-play-affordance");
    const dots = screen.getAllByTestId("memory-dots-affordance");
    expect(plays.length).toBeGreaterThan(0);
    for (const el of [...plays, ...dots]) {
      expect(el).toHaveAttribute("aria-hidden", "true");
      expect(el.tagName).not.toBe("BUTTON");
      expect(el.querySelector("button, a")).toBeNull();
    }
  });
});
