#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..");
const skillsRoot = path.join(repoRoot, "skills");
const allowedProperties = new Set([
  "allowed-tools",
  "description",
  "license",
  "metadata",
  "name",
]);
const maxSkillNameLength = 64;

function parseQuoted(value, quote) {
  if (!value.endsWith(quote) || value.length === 1) {
    throw new Error(`unterminated ${quote} quoted scalar`);
  }

  const inner = value.slice(1, -1);
  if (quote === "'") {
    return inner.replaceAll("''", "'");
  }

  try {
    return JSON.parse(value);
  } catch {
    throw new Error("invalid double-quoted scalar");
  }
}

function parsePlainScalar(value) {
  if (/:($|\s)/.test(value)) {
    throw new Error(
      "plain scalars cannot contain ': '; quote the value or use a folded block scalar",
    );
  }
  return value.trim();
}

function collectIndentedBlock(lines, start) {
  const blockLines = [];
  let index = start;

  while (index < lines.length) {
    const line = lines[index];
    if (line === "" || /^\s/.test(line)) {
      blockLines.push(line.replace(/^ {2}/, ""));
      index += 1;
      continue;
    }
    break;
  }

  return { value: blockLines.join("\n").trim(), nextIndex: index };
}

function parseFrontmatter(frontmatter) {
  const lines = frontmatter.split("\n");
  const parsed = new Map();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith("#")) {
      continue;
    }
    if (/^\s/.test(line)) {
      throw new Error(`unexpected indented line: ${line.trim()}`);
    }

    const match = /^([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
    if (!match) {
      throw new Error(`invalid frontmatter line: ${line}`);
    }

    const [, key, rawValue = ""] = match;
    if (!allowedProperties.has(key)) {
      throw new Error(
        `unexpected key '${key}'; allowed keys are ${[...allowedProperties]
          .sort()
          .join(", ")}`,
      );
    }

    const value = rawValue.trim();
    if (value === "") {
      const block = collectIndentedBlock(lines, index + 1);
      parsed.set(key, block.value ? { type: "nested" } : null);
      index = block.nextIndex - 1;
      continue;
    }

    if (/^[>|][-+]?$/.test(value)) {
      const block = collectIndentedBlock(lines, index + 1);
      parsed.set(key, block.value);
      index = block.nextIndex - 1;
      continue;
    }

    if (value.startsWith("'") || value.startsWith('"')) {
      parsed.set(key, parseQuoted(value, value[0]));
      continue;
    }

    parsed.set(key, parsePlainScalar(value));
  }

  return parsed;
}

function extractFrontmatter(content) {
  const normalized = content.replaceAll("\r\n", "\n");
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(normalized);
  if (!match) {
    throw new Error("missing or malformed YAML frontmatter block");
  }
  return match[1];
}

function validateSkillFrontmatter(skillName, fields) {
  const name = fields.get("name");
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("missing string 'name' in frontmatter");
  }
  if (!/^[a-z0-9-]+$/.test(name)) {
    throw new Error(
      `name '${name}' must use lowercase hyphen-case letters and digits`,
    );
  }
  if (name.startsWith("-") || name.endsWith("-") || name.includes("--")) {
    throw new Error(
      `name '${name}' cannot start/end with hyphen or contain consecutive hyphens`,
    );
  }
  if (name.length > maxSkillNameLength) {
    throw new Error(
      `name '${name}' is too long; maximum is ${maxSkillNameLength} characters`,
    );
  }
  if (name !== skillName) {
    throw new Error(`name '${name}' does not match skills/${skillName}`);
  }

  const description = fields.get("description");
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("missing string 'description' in frontmatter");
  }
  if (/[<>]/.test(description)) {
    throw new Error("description cannot contain angle brackets");
  }
  if (description.length > 1024) {
    throw new Error("description is too long; maximum is 1024 characters");
  }
}

async function main() {
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const skillNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const failures = [];

  for (const skillName of skillNames) {
    const skillPath = path.join(skillsRoot, skillName, "SKILL.md");
    if (!existsSync(skillPath)) {
      failures.push(`skills/${skillName}: missing SKILL.md`);
      continue;
    }

    try {
      const content = await readFile(skillPath, "utf8");
      const frontmatter = extractFrontmatter(content);
      const fields = parseFrontmatter(frontmatter);
      validateSkillFrontmatter(skillName, fields);
      console.log(`skills/${skillName}/SKILL.md is valid`);
    } catch (error) {
      failures.push(
        `skills/${skillName}/SKILL.md: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  if (failures.length > 0) {
    console.error("\nInvalid skill frontmatter:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
  }
}

await main();
