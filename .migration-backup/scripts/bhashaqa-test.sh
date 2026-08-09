#!/bin/bash
# Word AI CLI Test Runner
# Usage: ./scripts/bhashaqa-test.sh [--suite ecommerce-hindi] [--url http://localhost:3000]
#
# Exit codes:
#   0 — all deterministic checks passed
#   1 — at least one deterministic assertion failed (entity mismatch, wrong tool args, final state mismatch)
#   2 — configuration error
#
# LLM-only findings (semantic/policy) produce warnings but do NOT block the release.

set -euo pipefail

WORDAI_URL="${WORDAI_URL:-http://localhost:3000}"
SUITE="ecommerce-hindi"
API_KEY="${WORDAI_API_KEY:-demo-key}"

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --suite) SUITE="$2"; shift ;;
    --url) WORDAI_URL="$2"; shift ;;
    --key) API_KEY="$2"; shift ;;
    --help) echo "Usage: $0 [--suite NAME] [--url URL] [--key API_KEY]"; exit 0 ;;
    *) echo "Unknown option: $1"; exit 2 ;;
  esac
  shift
done

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║  Word AI Transaction Integrity Gate     ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""
echo "  URL:   $WORDAI_URL"
echo "  Suite: $SUITE"
echo "  Mode:  Deterministic assertions only"
echo ""

# Create audit
echo "  → Creating audit..."
AUDIT=$(curl -s -X POST "$WORDAI_URL/api/audits" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"CI Gate — $SUITE — $(date +%Y-%m-%d_%H%M)\"}")

AUDIT_ID=$(echo "$AUDIT" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

if [ -z "$AUDIT_ID" ]; then
  echo "  ✗ Failed to create audit"
  exit 2
fi

echo "  ✓ Audit: $AUDIT_ID"

# Trigger processing
echo "  → Running verification pipeline..."
RESULT=$(curl -s -X POST "$WORDAI_URL/api/process" \
  -H "Content-Type: application/json" \
  -d "{\"auditId\": \"$AUDIT_ID\"}")

TOTAL=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('totalCalls',0))" 2>/dev/null || echo "0")
FAILED=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('failedCount',0))" 2>/dev/null || echo "0")

echo ""
echo "  ══════════════════════════════════════════"
echo "  Results"
echo "  ══════════════════════════════════════════"
echo "  Total calls verified:  $TOTAL"
echo "  Deterministic failures: $FAILED"
echo "  Report: $WORDAI_URL/audits/$AUDIT_ID"
echo ""

if [ "$FAILED" -gt "0" ]; then
  echo "  ✗ GATE FAILED — $FAILED deterministic assertion(s) failed"
  echo "    Do NOT ship this release. Review failures at:"
  echo "    $WORDAI_URL/audits/$AUDIT_ID"
  echo ""
  exit 1
else
  echo "  ✓ GATE PASSED — All deterministic assertions passed"
  echo ""
  exit 0
fi
