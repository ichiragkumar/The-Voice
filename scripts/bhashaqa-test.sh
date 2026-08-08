#!/bin/bash
# BhashaQA CLI Test Runner
# Usage: ./scripts/bhashaqa-test.sh [--suite ecommerce-hindi] [--url http://localhost:3000]

BHASHAQA_URL="${BHASHAQA_URL:-http://localhost:3000}"
SUITE="ecommerce-hindi"
API_KEY="${BHASHAQA_API_KEY:-demo-key}"

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --suite) SUITE="$2"; shift ;;
    --url) BHASHAQA_URL="$2"; shift ;;
    --key) API_KEY="$2"; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

echo "╔══════════════════════════════════════╗"
echo "║  BhashaQA Voice Agent Test Runner    ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "  URL:   $BHASHAQA_URL"
echo "  Suite: $SUITE"
echo ""

# Create audit
echo "→ Creating audit..."
AUDIT=$(curl -s -X POST "$BHASHAQA_URL/api/audits" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"CLI Test — $SUITE — $(date +%Y-%m-%d)\"}")

AUDIT_ID=$(echo "$AUDIT" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

if [ -z "$AUDIT_ID" ]; then
  echo "✗ Failed to create audit"
  exit 1
fi

echo "  Audit ID: $AUDIT_ID"

# Trigger processing
echo "→ Running analysis..."
RESULT=$(curl -s -X POST "$BHASHAQA_URL/api/process" \
  -H "Content-Type: application/json" \
  -d "{\"auditId\": \"$AUDIT_ID\"}")

TOTAL=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('totalCalls',0))" 2>/dev/null)
FAILED=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('failedCount',0))" 2>/dev/null)

echo ""
echo "══════════════════════════════════════"
echo "  Results"
echo "══════════════════════════════════════"
echo "  Total calls:  $TOTAL"
echo "  Failures:     $FAILED"
echo "  Report:       $BHASHAQA_URL/audits/$AUDIT_ID"
echo ""

if [ "$FAILED" -gt "0" ]; then
  echo "✗ FAILED — $FAILED voice agent failures detected"
  exit 1
else
  echo "✓ PASSED — All voice agent transactions verified"
  exit 0
fi
