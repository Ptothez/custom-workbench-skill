#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(here, "..");
const validator = path.join(here, "validate-workbench-spec.mjs");
const validSpec = path.join(skillRoot, "assets", "workbench-spec.example.json");

const validResult = spawnSync(process.execPath, [validator, validSpec, "--portable"], {
  encoding: "utf8"
});
assert.equal(validResult.status, 0, validResult.stderr || validResult.stdout);
assert.match(validResult.stdout, /^VALID /);

const invalidSpec = JSON.parse(fs.readFileSync(validSpec, "utf8"));
invalidSpec.views[0].sourceIds = ["missing-source"];
invalidSpec.actions[1].confirmation = "never";
invalidSpec.privacy.containsSensitiveData = false;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "custom-workbench-test-"));
const invalidPath = path.join(tempDir, "invalid-spec.json");
fs.writeFileSync(invalidPath, JSON.stringify(invalidSpec, null, 2), "utf8");

try {
  const invalidResult = spawnSync(process.execPath, [validator, invalidPath], {
    encoding: "utf8"
  });
  assert.equal(invalidResult.status, 1, invalidResult.stderr || invalidResult.stdout);
  assert.match(invalidResult.stderr, /unknown source/);
  assert.match(invalidResult.stderr, /cannot use confirmation=never/);
  assert.match(invalidResult.stderr, /must be true when a field is sensitive/);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

console.log("PASS valid spec accepted and unsafe invalid spec rejected");
