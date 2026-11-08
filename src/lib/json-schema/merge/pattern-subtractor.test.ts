import { describe, expect, it } from "vitest";

import { createPatternSubtractor } from "./pattern-subtractor.ts";
import { simplePatternsMerger } from "./patterns.ts";

describe("createPatternSubtractor", () => {
  it("uses the default pattern merger and escapes property names", () => {
    const subtract = createPatternSubtractor();
    expect(subtract("^a", ["a.b"], [])).toBe(
      simplePatternsMerger("^a", "^(?!(?:(?:a\\.b)(?![\\s\\S])))")
    );
  });

  it("does not subtract names that do not match the pattern", () => {
    const subtract = createPatternSubtractor();
    expect(subtract("^a", ["b"], [])).toBe("^a");
    expect(subtract("^a", [], [])).toBe("^a");
  });

  it("subtracts names matching the given patterns", () => {
    const subtract = createPatternSubtractor();
    expect(subtract("^a", [], ["^b", "c$"])).toBe(
      simplePatternsMerger("^a", "^(?!(?:[\\s\\S]*(?:^b|c$)))")
    );
  });

  it("uses the provided pattern merger", () => {
    const calls: [string, string][] = [];
    const subtract = createPatternSubtractor({
      mergePatterns: (a, b) => {
        calls.push([a, b]);
        return `custom(${a},${b})`;
      },
    });
    expect(subtract("^a", ["ab"], [])).toBe(
      "custom(^a,^(?!(?:(?:ab)(?![\\s\\S]))))"
    );
    expect(calls).toEqual([["^a", "^(?!(?:(?:ab)(?![\\s\\S])))"]]);
  });

  it("uses the provided property name escaper", () => {
    const subtract = createPatternSubtractor({
      escapePropertyName: (name) => `<${name}>`,
    });
    expect(subtract("^a", ["a.b"], [])).toBe(
      simplePatternsMerger("^a", "^(?!(?:(?:<a.b>)(?![\\s\\S])))")
    );
  });
});
