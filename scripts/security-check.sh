#!/bin/bash
# Security Misconfiguration Checker
# Part of ROOSE-95 - Security Misconfiguration Checks
# Version: 1.0.0

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
INFO=0

echo -e "${BLUE}🔒 Roosevelt OPS Security Configuration Checker${NC}"
echo ""

# ============================================
# 1. Environment Variables
# ============================================
echo -e "${BLUE}[1/6] Checking Environment Variables...${NC}"

# Check for .env files in git
ENV_IN_GIT=$(git ls-files | grep "^\.env\." | grep -v "\.example$" || true)
if [ -n "$ENV_IN_GIT" ]; then
    echo -e "${RED}❌ CRITICAL: .env files found in git:${NC}"
    echo "$ENV_IN_GIT"
    echo "   Remove with: git rm --cached .env.local .env.production"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ No .env files in git${NC}"
fi

# Check if .env.local exists but is in .gitignore
if [ -f ".env.local" ]; then
    if grep -q "^\.env\.local$" .gitignore 2>/dev/null; then
        echo -e "${GREEN}✅ .env.local exists and is gitignored${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.local exists but may not be in .gitignore${NC}"
        ((WARNINGS++))
    fi
fi

# Check for example files
if [ ! -f ".env.example" ] && [ ! -f ".env.local.example" ]; then
    echo -e "${YELLOW}⚠️  No .env.example template found${NC}"
    echo "   Developers need an example file for setup"
    ((WARNINGS++))
else
    echo -e "${GREEN}✅ Environment template exists${NC}"
fi

echo ""

# ============================================
# 2. Security Headers
# ============================================
echo -e "${BLUE}[2/6] Checking Security Headers...${NC}"

CONFIG_FILE="next.config.js"
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ No next.config.js found${NC}"
    ((ERRORS++))
else
    # Required headers
    REQUIRED_HEADERS=(
        "X-Frame-Options"
        "X-Content-Type-Options"
        "Strict-Transport-Security"
        "Referrer-Policy"
        "Permissions-Policy"
        "Content-Security-Policy"
    )

    MISSING=0
    for header in "${REQUIRED_HEADERS[@]}"; do
        if grep -q "$header" "$CONFIG_FILE"; then
            echo -e "${GREEN}✅ $header configured${NC}"
        else
            echo -e "${YELLOW}⚠️  $header missing${NC}"
            ((WARNINGS++))
            ((MISSING++))
        fi
    done

    if [ $MISSING -eq 0 ]; then
        echo -e "${GREEN}✅ All security headers present${NC}"
    fi
fi

echo ""

# ============================================
# 3. Dependencies
# ============================================
echo -e "${BLUE}[3/6] Checking Dependencies...${NC}"

# Check for known vulnerable packages
if [ -f "package.json" ]; then
    # Check if @types packages are in dependencies (should be devDependencies)
    TYPES_IN_PROD=$(jq -r '.dependencies | keys[] | select(startswith("@types"))' package.json 2>/dev/null || true)
    if [ -n "$TYPES_IN_PROD" ]; then
        echo -e "${YELLOW}⚠️  Type definitions in production dependencies:${NC}"
        echo "$TYPES_IN_PROD"
        echo "   Move to devDependencies"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ Clean production dependencies${NC}"
    fi

    # Check Next.js version
    NEXT_VERSION=$(jq -r '.dependencies.next // .devDependencies.next' package.json)
    MAJOR_VERSION=$(echo "$NEXT_VERSION" | sed -n 's/[^0-9]*\([0-9]*\).*/\1/p')

    if [ "$MAJOR_VERSION" -lt 14 ]; then
        echo -e "${YELLOW}⚠️  Next.js $NEXT_VERSION may be outdated${NC}"
        echo "   Consider upgrading to Next.js 14+"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ Next.js version $NEXT_VERSION${NC}"
    fi
fi

echo ""

# ============================================
# 4. CORS Configuration
# ============================================
echo -e "${BLUE}[4/6] Checking CORS Configuration...${NC}"

# Check for wildcard CORS in API routes
if [ -d "app/api" ]; then
    CORS_WILDCARD=$(grep -rn "Access-Control-Allow-Origin.*\*" app/api/ 2>/dev/null || true)
    if [ -n "$CORS_WILDCARD" ]; then
        echo -e "${YELLOW}⚠️  Wildcard CORS found:${NC}"
        echo "$CORS_WILDCARD"
        echo "   Use specific origins in production"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ No wildcard CORS detected${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  No API routes found${NC}"
    ((INFO++))
fi

echo ""

# ============================================
# 5. Hardcoded Secrets
# ============================================
echo -e "${BLUE}[5/6] Checking for Hardcoded Secrets...${NC}"

# Common secret patterns
SECRET_PATTERNS=(
    "password.*=.*['\"][a-zA-Z0-9]{8,}['\"]"
    "api[_-]?key.*=.*['\"][a-zA-Z0-9]{20,}['\"]"
)

FOUND_SECRETS=0
for pattern in "${SECRET_PATTERNS[@]}"; do
    MATCHES=$(grep -rn -E "$pattern" \
        --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist \
        . 2>/dev/null || true)

    if [ -n "$MATCHES" ]; then
        echo -e "${YELLOW}⚠️  Potential hardcoded secret:${NC}"
        echo "$MATCHES"
        ((WARNINGS++))
        ((FOUND_SECRETS++))
    fi
done

if [ $FOUND_SECRETS -eq 0 ]; then
    echo -e "${GREEN}✅ No obvious hardcoded secrets found${NC}"
fi

echo ""

# ============================================
# 6. Docker Security (if applicable)
# ============================================
echo -e "${BLUE}[6/6] Checking Docker Configuration...${NC}"

if [ -f "Dockerfile" ]; then
    # Check for secrets in Dockerfile
    if grep -q "ENV.*PASSWORD\|ENV.*SECRET\|ENV.*KEY" Dockerfile; then
        echo -e "${RED}❌ Potential secrets in Dockerfile${NC}"
        echo "   Use build args or runtime secrets instead"
        ((ERRORS++))
    else
        echo -e "${GREEN}✅ No secrets in Dockerfile${NC}"
    fi

    # Check for root user
    if ! grep -q "^USER" Dockerfile; then
        echo -e "${YELLOW}⚠️  Dockerfile doesn't set USER (runs as root)${NC}"
        echo "   Add non-root user for security"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ Dockerfile uses non-root user${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  No Dockerfile found (Vercel deployment)${NC}"
    ((INFO++))
fi

echo ""

# ============================================
# Summary
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Summary:${NC}"
echo -e "  ${RED}Errors: $ERRORS${NC}"
echo -e "  ${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "  ${BLUE}Info: $INFO${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Security issues found - fix before deploying${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warnings detected - review recommended${NC}"
    exit 0
else
    echo -e "${GREEN}✅ All checks passed${NC}"
    exit 0
fi
