import { escapeRegExp } from "../../regexp.ts";
import type { Merger } from "./merge.ts";

import { simplePatternsMerger } from "./patterns.ts";

/**
 * A pattern subtractor removes property names and names matching the given
 * patterns from a pattern.
 */
export type PatternSubtractor = (
  pattern: string,
  propertyNames: string[],
  patterns: string[]
) => string;

export interface PatternSubtractorOptions {
  /**
   * Merger function for combining regular expression patterns.
   * @default simplePatternsMerger
   */
  mergePatterns?: Merger<string>;

  /**
   * Escapes a property name so it can be embedded as a literal in a pattern.
   * @default escapeRegExp
   */
  escapePropertyName?: (name: string) => string;
}

/**
 * Creates a pattern subtractor that builds a negative lookahead pattern and
 * combines it with the configured pattern merger.
 */
export function createPatternSubtractor({
  mergePatterns = simplePatternsMerger,
  escapePropertyName = escapeRegExp,
}: PatternSubtractorOptions = {}): PatternSubtractor {
  return (pattern, propertyNames, patterns) => {
    const propertyNamesLen = propertyNames.length;
    const patternsLen = patterns.length;
    let names: string | undefined;
    if (propertyNamesLen > 0) {
      const regExp = new RegExp(pattern);
      for (let i = 0; i < propertyNamesLen; i++) {
        const name = propertyNames[i]!;
        if (!regExp.test(name)) {
          continue;
        }
        const escapedName = escapePropertyName(name);
        names = names === undefined ? escapedName : `${names}|${escapedName}`;
      }
    }
    if (names === undefined && patternsLen === 0) {
      return pattern;
    }
    const excluded: string[] = [];
    if (names !== undefined) {
      // `$` also matches before a trailing newline, so assert the true end of
      // the property name instead.
      excluded.push(`(?:${names})(?![\\s\\S])`);
    }
    if (patternsLen > 0) {
      let alternatives = patterns[0]!;
      for (let i = 1; i < patternsLen; i++) {
        alternatives += `|${patterns[i]!}`;
      }
      // Reproduce `RegExp.prototype.test` search semantics inside the anchored
      // lookahead. `[\s\S]` (unlike `.`) can also skip line terminators.
      excluded.push(`[\\s\\S]*(?:${alternatives})`);
    }
    // `^(?!...)` matches names that are not excluded, so combining it with the
    // original pattern yields the required subset.
    return mergePatterns(pattern, `^(?!(?:${excluded.join("|")}))`);
  };
}
