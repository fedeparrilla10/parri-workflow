#!/usr/bin/env bash

set -uo pipefail

ALLOWED_TEST_ENVIRONMENTS_JSON='__PARRI_ALLOWED_TEST_ENVIRONMENTS_JSON__'
ALLOWED_DB_HOSTS_JSON='__PARRI_ALLOWED_DB_HOSTS_JSON__'
ALLOWED_DB_NAMES_JSON='__PARRI_ALLOWED_DB_NAMES_JSON__'
DATABASE_IDENTITY_COMMAND=(__PARRI_DATABASE_IDENTITY_COMMAND__)
TEST_COMMAND=(__PARRI_TEST_COMMAND__)

ok() { printf '[OK] %s\n' "$1"; }
warn() { printf '[WARN] %s\n' "$1"; }
fail() { printf '[FAIL] %s\n' "$1" >&2; }

if (( $# != 0 )); then
  fail "init.sh does not accept arguments"
  exit 1
fi

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR" || exit 1

if ! command -v git >/dev/null 2>&1; then
  fail "Git is required"
  exit 1
fi

if [[ "$(git rev-parse --is-inside-work-tree 2>/dev/null)" != "true" ]]; then
  fail "Project root is not inside a Git work tree"
  exit 1
fi

for required_file in features.json progress/current.md progress/history.md docs/engineering.md; do
  if [[ ! -f "$required_file" ]]; then
    fail "Missing required harness file: $required_file"
    exit 1
  fi
done

if ! command -v python3 >/dev/null 2>&1; then
  fail "python3 is required to validate the harness"
  exit 1
fi

if ! python3 <<'PY'
import glob
import json
import os
import re
import sys


def stop(message):
    print(f"[FAIL] {message}", file=sys.stderr)
    raise SystemExit(1)


try:
    with open("features.json", encoding="utf-8") as feature_file:
        features = json.load(feature_file)
except Exception:
    stop("features.json is not valid JSON")

if not isinstance(features, list):
    stop("features.json must contain a JSON array")

required_fields = {
    "id",
    "title",
    "description",
    "acceptance_criteria",
    "brief",
    "sdd",
    "status",
}
allowed_statuses = {"pending", "spec_ready", "in_progress", "done"}
artifact_statuses = {"spec_ready", "in_progress", "done"}
seen_ids = set()
in_progress = 0

for feature in features:
    if not isinstance(feature, dict) or not required_fields.issubset(feature):
        stop("Every feature must contain all required fields")

    feature_id = feature["id"]
    if not isinstance(feature_id, str) or not re.fullmatch(r"F-\d{3}", feature_id):
        stop("Every feature ID must match F-NNN")
    if feature_id in seen_ids:
        stop("Feature IDs must be unique")
    seen_ids.add(feature_id)

    if feature["status"] not in allowed_statuses:
        stop(f"Feature {feature_id} has an invalid status")
    if feature["status"] == "in_progress":
        in_progress += 1

    if not isinstance(feature["sdd"], bool):
        stop(f"Feature {feature_id} has an invalid sdd value")
    if not isinstance(feature["acceptance_criteria"], list):
        stop(f"Feature {feature_id} has invalid acceptance criteria")

    feature_dirs = [path for path in glob.glob(f"features/{feature_id}-*") if os.path.isdir(path)]
    if feature["sdd"]:
        if len(feature_dirs) != 1:
            stop(f"Feature {feature_id} must have exactly one SDD directory")
        feature_dir = feature_dirs[0]
        expected_brief = f"{feature_dir}/brief.md"
        brief = feature["brief"]
        if brief is not None and brief != expected_brief:
            stop(f"Feature {feature_id} has an invalid brief path")
        if brief is not None and not os.path.isfile(brief):
            stop(f"Feature {feature_id} references a missing brief")
        if feature["status"] in artifact_statuses:
            for artifact in ("requirements.md", "design.md", "tasks.md"):
                if not os.path.isfile(os.path.join(feature_dir, artifact)):
                    stop(f"Feature {feature_id} is missing required SDD artifacts")
    elif feature["brief"] is not None:
        stop(f"Non-SDD feature {feature_id} cannot reference a brief")

if in_progress > 1:
    stop("Only one feature may be in_progress")
PY
then
  exit 1
fi
ok "Harness state"

if [[ "$ALLOWED_TEST_ENVIRONMENTS_JSON" == *"__PARRI_"* \
  || "$ALLOWED_DB_HOSTS_JSON" == *"__PARRI_"* \
  || "$ALLOWED_DB_NAMES_JSON" == *"__PARRI_"* \
  || "${DATABASE_IDENTITY_COMMAND[*]}" == *"__PARRI_"* \
  || "${TEST_COMMAND[*]}" == *"__PARRI_"* ]]; then
  fail "Protected project checks are not configured"
  exit 1
fi

if (( ${#DATABASE_IDENTITY_COMMAND[@]} == 0 || ${#TEST_COMMAND[@]} == 0 )); then
  fail "Protected project checks are not configured"
  exit 1
fi

database_safety_check() {
  "${DATABASE_IDENTITY_COMMAND[@]}" 2>/dev/null | python3 -c '
import json
import sys

try:
    identity = json.load(sys.stdin)
    allowed_environments = json.loads(sys.argv[1])
    allowed_hosts = json.loads(sys.argv[2])
    allowed_databases = json.loads(sys.argv[3])
except Exception:
    raise SystemExit(1)

if set(identity) != {"environment", "host", "database"}:
    raise SystemExit(1)
if not all(isinstance(value, str) and value for value in identity.values()):
    raise SystemExit(1)
if not all(isinstance(values, list) and values for values in (
    allowed_environments,
    allowed_hosts,
    allowed_databases,
)):
    raise SystemExit(1)
if not all(isinstance(value, str) and value for values in (
    allowed_environments,
    allowed_hosts,
    allowed_databases,
) for value in values):
    raise SystemExit(1)

safe = (
    identity["environment"] in allowed_environments
    and identity["host"] in allowed_hosts
    and identity["database"] in allowed_databases
)
raise SystemExit(0 if safe else 1)
' "$ALLOWED_TEST_ENVIRONMENTS_JSON" "$ALLOWED_DB_HOSTS_JSON" "$ALLOWED_DB_NAMES_JSON"
}

if ! database_safety_check; then
  fail "Database safety could not be proven"
  warn "Product tests were not executed"
  exit 1
fi
ok "Database safety"

if ! "${TEST_COMMAND[@]}"; then
  fail "Product tests"
  exit 1
fi
ok "Product tests"
ok "Complete gate"
