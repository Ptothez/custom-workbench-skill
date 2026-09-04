#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const portable = args.includes("--portable");
const fileArg = args.find((arg) => !arg.startsWith("--"));

if (!fileArg) {
  console.error("Usage: node validate-workbench-spec.mjs <spec.json> [--portable]");
  process.exit(2);
}

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireObject(value, label) {
  if (!isObject(value)) {
    fail(`${label} must be an object`);
    return false;
  }
  return true;
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${label} must be a non-empty string`);
    return false;
  }
  return true;
}

function requireArray(value, label, min = 0) {
  if (!Array.isArray(value)) {
    fail(`${label} must be an array`);
    return false;
  }
  if (value.length < min) {
    fail(`${label} must contain at least ${min} item(s)`);
    return false;
  }
  return true;
}

function indexById(items, label) {
  const ids = new Set();
  if (!Array.isArray(items)) return ids;
  for (const [index, item] of items.entries()) {
    if (!isObject(item)) {
      fail(`${label}[${index}] must be an object`);
      continue;
    }
    if (!requireString(item.id, `${label}[${index}].id`)) continue;
    if (ids.has(item.id)) fail(`${label} contains duplicate id: ${item.id}`);
    ids.add(item.id);
  }
  return ids;
}

function walkStrings(value, visit, trail = "$root") {
  if (typeof value === "string") {
    visit(value, trail);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, visit, `${trail}[${index}]`));
    return;
  }
  if (isObject(value)) {
    Object.entries(value).forEach(([key, item]) => walkStrings(item, visit, `${trail}.${key}`));
  }
}

let spec;
const resolvedPath = path.resolve(fileArg);
try {
  spec = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
} catch (error) {
  console.error(`INVALID: cannot read or parse ${resolvedPath}: ${error.message}`);
  process.exit(1);
}

if (!requireObject(spec, "spec")) {
  console.error(`INVALID ${resolvedPath}\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

if (spec.schemaVersion !== "1.0") fail('schemaVersion must equal "1.0"');

if (requireObject(spec.identity, "identity")) {
  requireString(spec.identity.name, "identity.name");
  requireString(spec.identity.primaryUser, "identity.primaryUser");
  requireString(spec.identity.roleContext, "identity.roleContext");
  requireString(spec.identity.objective, "identity.objective");
  requireArray(spec.identity.decisionsSupported, "identity.decisionsSupported", 1);
  requireArray(spec.identity.outOfScope, "identity.outOfScope", 0);
}

const primaryUnits = new Set(["person", "project", "case", "asset", "time-cycle", "hybrid"]);
if (requireObject(spec.organization, "organization")) {
  if (!primaryUnits.has(spec.organization.primaryUnit)) {
    fail(`organization.primaryUnit must be one of: ${[...primaryUnits].join(", ")}`);
  }
  requireString(spec.organization.entityLabel, "organization.entityLabel");
  requireArray(spec.organization.hierarchy, "organization.hierarchy", 1);
}

requireArray(spec.navigation, "navigation", 1);
requireArray(spec.views, "views", 1);
requireArray(spec.fields, "fields", 1);
requireArray(spec.dataSources, "dataSources", 1);
requireArray(spec.actions, "actions", 0);
requireArray(spec.acceptance, "acceptance", 2);

const navigationIds = indexById(spec.navigation, "navigation");
const workflowIds = indexById(spec.workflows ?? [], "workflows");
const viewIds = indexById(spec.views, "views");
const fieldIds = indexById(spec.fields, "fields");
const sourceIds = indexById(spec.dataSources, "dataSources");
const actionIds = indexById(spec.actions, "actions");
const acceptanceIds = indexById(spec.acceptance, "acceptance");

void navigationIds;
void workflowIds;
void viewIds;
void actionIds;
void acceptanceIds;

const viewKinds = new Set(["queue", "profile", "table", "kanban", "timeline", "metrics", "calendar", "review"]);
for (const [index, view] of (spec.views ?? []).entries()) {
  if (!isObject(view)) continue;
  requireString(view.label, `views[${index}].label`);
  if (!viewKinds.has(view.kind)) fail(`views[${index}].kind is not supported: ${view.kind}`);
  requireString(view.questionAnswered, `views[${index}].questionAnswered`);
  if (requireArray(view.fieldIds, `views[${index}].fieldIds`, 0)) {
    for (const id of view.fieldIds) {
      if (!fieldIds.has(id)) fail(`views[${index}].fieldIds references unknown field: ${id}`);
    }
  }
  if (requireArray(view.sourceIds, `views[${index}].sourceIds`, 1)) {
    for (const id of view.sourceIds) {
      if (!sourceIds.has(id)) fail(`views[${index}].sourceIds references unknown source: ${id}`);
    }
  }
}

let hasSensitiveField = false;
for (const [index, field] of (spec.fields ?? []).entries()) {
  if (!isObject(field)) continue;
  requireString(field.label, `fields[${index}].label`);
  requireString(field.type, `fields[${index}].type`);
  if (!["public", "internal", "personal", "sensitive"].includes(field.sensitivity)) {
    fail(`fields[${index}].sensitivity is invalid: ${field.sensitivity}`);
  }
  if (field.sensitivity === "sensitive") hasSensitiveField = true;
  if (!sourceIds.has(field.sourceId)) {
    fail(`fields[${index}].sourceId references unknown source: ${field.sourceId}`);
  }
  if (typeof field.required !== "boolean") fail(`fields[${index}].required must be boolean`);
}

let hasAutomaticWrite = false;
for (const [index, source] of (spec.dataSources ?? []).entries()) {
  if (!isObject(source)) continue;
  requireString(source.label, `dataSources[${index}].label`);
  requireString(source.location, `dataSources[${index}].location`);
  if (!["source-of-truth", "snapshot", "derived"].includes(source.authority)) {
    fail(`dataSources[${index}].authority is invalid: ${source.authority}`);
  }
  if (!["read-only", "confirmed-write", "automatic"].includes(source.writeMode)) {
    fail(`dataSources[${index}].writeMode is invalid: ${source.writeMode}`);
  }
  if (source.writeMode === "automatic") hasAutomaticWrite = true;
}

for (const [index, action] of (spec.actions ?? []).entries()) {
  if (!isObject(action)) continue;
  requireString(action.label, `actions[${index}].label`);
  requireString(action.target, `actions[${index}].target`);
  if (!["never", "when-writing", "always"].includes(action.confirmation)) {
    fail(`actions[${index}].confirmation is invalid: ${action.confirmation}`);
  }
  if (["update-source", "run-command"].includes(action.kind) && action.confirmation === "never") {
    fail(`actions[${index}] ${action.kind} cannot use confirmation=never`);
  }
}

if (requireObject(spec.privacy, "privacy")) {
  if (typeof spec.privacy.containsSensitiveData !== "boolean") {
    fail("privacy.containsSensitiveData must be boolean");
  }
  requireString(spec.privacy.storageBoundary, "privacy.storageBoundary");
  requireArray(spec.privacy.redactionRules, "privacy.redactionRules", hasSensitiveField ? 1 : 0);
  if (hasSensitiveField && spec.privacy.containsSensitiveData !== true) {
    fail("privacy.containsSensitiveData must be true when a field is sensitive");
  }
  if (hasSensitiveField && hasAutomaticWrite) {
    requireString(spec.privacy.writeAuthorization, "privacy.writeAuthorization");
  }
}

if (requireObject(spec.visualDirection, "visualDirection")) {
  if (!["compact", "balanced", "spacious"].includes(spec.visualDirection.density)) {
    fail(`visualDirection.density is invalid: ${spec.visualDirection.density}`);
  }
  requireString(spec.visualDirection.tone, "visualDirection.tone");
  if (!["desktop", "mobile", "both"].includes(spec.visualDirection.primaryDevice)) {
    fail(`visualDirection.primaryDevice is invalid: ${spec.visualDirection.primaryDevice}`);
  }
}

for (const [index, item] of (spec.acceptance ?? []).entries()) {
  if (!isObject(item)) continue;
  requireString(item.scenario, `acceptance[${index}].scenario`);
  requireString(item.expected, `acceptance[${index}].expected`);
}

walkStrings(spec, (value, trail) => {
  if (/\b(?:TODO|TBD|FIXME)\b/i.test(value) || /<[^>]+>/.test(value)) {
    fail(`${trail} contains an unfinished placeholder`);
  }
  if (portable && (/^[A-Za-z]:[\\/]/.test(value) || /^\\\\/.test(value))) {
    fail(`${trail} contains a machine-specific absolute path in portable mode`);
  }
});

if (spec.privacy?.containsSensitiveData && !hasSensitiveField) {
  warn("privacy declares sensitive data but no field is marked sensitive");
}

if (errors.length > 0) {
  console.error(`INVALID ${resolvedPath}`);
  errors.forEach((message) => console.error(`- ${message}`));
  warnings.forEach((message) => console.error(`- warning: ${message}`));
  process.exit(1);
}

console.log(`VALID ${resolvedPath}`);
warnings.forEach((message) => console.log(`WARNING ${message}`));
