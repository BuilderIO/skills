import assert from "node:assert/strict";
import { test } from "node:test";
import { parseFrontmatter } from "./check-skill-frontmatter.mjs";

test("rejects plain scalars that start with a YAML indicator", () => {
  for (const description of [
    "`/plan` before coding",
    "[Experimental] Run the factory",
    "{beta} Run the factory",
    "*Always* read the docs",
    "@agent reviews the plan",
    "%TODO review the plan",
    "&anchor review the plan",
    "!important review the plan",
    "# review the plan",
    "- review the plan",
    "? review the plan",
    "> review the plan",
  ]) {
    assert.throws(
      () => parseFrontmatter(`name: demo\ndescription: ${description}`),
      /plain scalars cannot start with/,
      description,
    );
  }
});

test("accepts plain, quoted, and folded descriptions", () => {
  for (const [line, expected] of [
    [
      "description: Use when planning `/plan` work",
      "Use when planning `/plan` work",
    ],
    ["description: -1 is not an indicator", "-1 is not an indicator"],
    ['description: "`/plan` before coding"', "`/plan` before coding"],
    [
      "description: '[Experimental] Run the factory'",
      "[Experimental] Run the factory",
    ],
    ["description: >-\n  `/plan` before coding", "`/plan` before coding"],
  ]) {
    const fields = parseFrontmatter(`name: demo\n${line}`);
    assert.equal(fields.get("description"), expected);
  }
});
