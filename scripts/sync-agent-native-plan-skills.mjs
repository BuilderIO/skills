#!/usr/bin/env node
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..");
const defaultFrameworkPath = path.resolve(
  repoRoot,
  "../agent-native",
);

const args = process.argv.slice(2);
const check = args.includes("--check");
const sourceArg = args.find((arg) => arg !== "--check");

const requestedSource =
  sourceArg ||
  process.env.AGENT_NATIVE_PLAN_SKILLS_SOURCE ||
  process.env.AGENT_NATIVE_FRAMEWORK_PATH ||
  defaultFrameworkPath;

const destinationRoot = path.join(repoRoot, "skills");
const publicDocOverlays = new Set(["README.md"]);

function hasSkill(dir) {
  return existsSync(path.join(dir, "SKILL.md"));
}

function resolveSources(sourcePath) {
  const source = path.resolve(sourcePath);
  const candidates = [
    {
      label: "direct skills directory",
      visualPlan: path.join(source, "visual-plan"),
      visualRecap: path.join(source, "visual-recap"),
    },
    {
      label: "repo skills directory",
      visualPlan: path.join(source, "skills", "visual-plan"),
      visualRecap: path.join(source, "skills", "visual-recap"),
    },
    {
      label: "Agent-Native visual plans plugin",
      visualPlan: path.join(
        source,
        ".agents/plugins/agent-native-visual-plans/skills/visual-plan",
      ),
      visualRecap: path.join(
        source,
        ".agents/plugins/agent-native-visual-plans/skills/visual-recap",
      ),
    },
    {
      label: "legacy framework skills",
      visualPlan: path.join(source, "skills", "visual-plans"),
      visualRecap: path.join(source, "skills", "visual-recap"),
    },
  ];

  const match = candidates.find(
    (candidate) =>
      hasSkill(candidate.visualPlan) && hasSkill(candidate.visualRecap),
  );

  if (!match) {
    const checked = candidates
      .map(
        (candidate) =>
          `- ${candidate.label}: ${candidate.visualPlan} and ${candidate.visualRecap}`,
      )
      .join("\n");

    throw new Error(
      `Could not find both visual-plan and visual-recap skills from ${source}.\nChecked:\n${checked}`,
    );
  }

  return match;
}

async function copySkill(name, sourceDir) {
  const destination = path.join(destinationRoot, name);
  const preservedDocs = [];

  for (const rel of publicDocOverlays) {
    const docPath = path.join(destination, rel);
    if (existsSync(docPath)) {
      preservedDocs.push([rel, await readFile(docPath, "utf8")]);
    }
  }

  await rm(destination, { recursive: true, force: true });
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(sourceDir, destination, { recursive: true });

  for (const [rel, body] of preservedDocs) {
    await mkdir(path.dirname(path.join(destination, rel)), { recursive: true });
    await rm(path.join(destination, rel), { force: true });
    await writeFile(path.join(destination, rel), body);
  }

  console.log(`Synced ${name}`);
  console.log(`  from ${sourceDir}`);
  console.log(`  to   ${destination}`);
}

async function listFiles(dir, prefix = "") {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listFiles(abs, rel)));
    } else if (entry.isFile()) {
      out.push(rel);
    }
  }
  return out.sort();
}

async function assertSkillCurrent(name, sourceDir) {
  const destination = path.join(destinationRoot, name);
  if (!existsSync(destination)) {
    throw new Error(`${name} is missing at ${destination}`);
  }

  const sourceFiles = (await listFiles(sourceDir)).filter(
    (rel) => !publicDocOverlays.has(rel),
  );
  const destinationFiles = (await listFiles(destination)).filter(
    (rel) => !publicDocOverlays.has(rel),
  );
  if (sourceFiles.join("\n") !== destinationFiles.join("\n")) {
    throw new Error(`${name} file list is out of sync`);
  }

  for (const rel of sourceFiles) {
    const [sourceBody, destinationBody] = await Promise.all([
      readFile(path.join(sourceDir, rel), "utf8"),
      readFile(path.join(destination, rel), "utf8"),
    ]);
    if (sourceBody !== destinationBody) {
      throw new Error(`${name}/${rel} is out of sync`);
    }
  }
  console.log(`${name} is current`);
}

try {
  const sources = resolveSources(requestedSource);

  console.log(`Using ${sources.label}`);
  if (check) {
    await assertSkillCurrent("visual-plan", sources.visualPlan);
    await assertSkillCurrent("visual-recap", sources.visualRecap);
  } else {
    await copySkill("visual-plan", sources.visualPlan);
    await copySkill("visual-recap", sources.visualRecap);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
