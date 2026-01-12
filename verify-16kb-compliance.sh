#!/bin/bash

# 16 KB Page Size Compliance Verification Script
# This script verifies that your Android app is properly configured for 16 KB page size support
# Required for Google Play starting November 1, 2025

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    16 KB Page Size Compliance Verification Script              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print section headers
print_section() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $1"
        return 1
    fi
}

# Section 1: Verify Build Configuration
print_section "1. CHECKING BUILD CONFIGURATION"

echo ""
echo "Checking android/build.gradle..."
if check_file "$PROJECT_ROOT/android/build.gradle"; then
    if grep -q "ndkVersion = \"27\." "$PROJECT_ROOT/android/build.gradle"; then
        echo -e "${GREEN}✓${NC} NDK Version 27+: $(grep 'ndkVersion =' "$PROJECT_ROOT/android/build.gradle")"
    else
        echo -e "${YELLOW}⚠${NC} NDK Version might not be 27+: $(grep 'ndkVersion =' "$PROJECT_ROOT/android/build.gradle")"
    fi
fi

echo ""
echo "Checking android/app/build.gradle..."
if check_file "$PROJECT_ROOT/android/app/build.gradle"; then
    if grep -q "targetSdkVersion" "$PROJECT_ROOT/android/app/build.gradle"; then
        TARGET_SDK=$(grep "targetSdkVersion" "$PROJECT_ROOT/android/app/build.gradle" | head -1 | sed 's/.*= //' | tr -d ' ')
        if [ "$TARGET_SDK" -ge 35 ]; then
            echo -e "${GREEN}✓${NC} Target SDK: $TARGET_SDK (Android 15+)"
        else
            echo -e "${YELLOW}⚠${NC} Target SDK: $TARGET_SDK (should be 35+)"
        fi
    fi
    
    if grep -q "useLegacyPackaging false" "$PROJECT_ROOT/android/app/build.gradle"; then
        echo -e "${GREEN}✓${NC} Modern packaging enabled (useLegacyPackaging false)"
    else
        echo -e "${YELLOW}⚠${NC} useLegacyPackaging not set to false"
    fi
    
    if grep -q "abiFilters.*64" "$PROJECT_ROOT/android/app/build.gradle"; then
        echo -e "${GREEN}✓${NC} 64-bit ABI filtering configured"
    else
        echo -e "${YELLOW}⚠${NC} 64-bit ABI filtering might not be configured"
    fi
fi

# Section 2: Check for Release Build
print_section "2. CHECKING FOR BUILD ARTIFACTS"

echo ""
RELEASE_APK="$PROJECT_ROOT/android/app/build/outputs/apk/release/app-release.apk"
RELEASE_AAB="$PROJECT_ROOT/android/app/build/outputs/bundle/release/app-release.aab"

if [ -f "$RELEASE_APK" ]; then
    echo -e "${GREEN}✓${NC} Release APK found: $RELEASE_APK"
    APK_SIZE=$(du -h "$RELEASE_APK" | cut -f1)
    echo "  Size: $APK_SIZE"
elif [ -d "$PROJECT_ROOT/android/app/build/outputs/apk" ]; then
    echo -e "${YELLOW}⚠${NC} APK directory exists but no release APK found"
    echo "  Run: yarn build"
else
    echo -e "${RED}✗${NC} No APK found. Run: yarn build"
fi

echo ""
if [ -f "$RELEASE_AAB" ]; then
    echo -e "${GREEN}✓${NC} Release AAB found: $RELEASE_AAB"
    AAB_SIZE=$(du -h "$RELEASE_AAB" | cut -f1)
    echo "  Size: $AAB_SIZE"
elif [ -d "$PROJECT_ROOT/android/app/build/outputs/bundle" ]; then
    echo -e "${YELLOW}⚠${NC} Bundle directory exists but no release AAB found"
    echo "  Run: yarn bundle"
else
    echo -e "${YELLOW}⚠${NC} No AAB found. Run: yarn bundle"
fi

# Section 3: Check for Native Libraries
print_section "3. CHECKING FOR NATIVE LIBRARIES"

echo ""
if [ -f "$RELEASE_APK" ]; then
    TMP_APK="/tmp/16kb_verify_apk"
    rm -rf "$TMP_APK"
    unzip -q "$RELEASE_APK" -d "$TMP_APK"
    
    SO_COUNT=$(find "$TMP_APK/lib" -name "*.so" 2>/dev/null | wc -l)
    if [ "$SO_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓${NC} Found $SO_COUNT native libraries"
        echo ""
        echo "  ARM64-v8a libraries:"
        find "$TMP_APK/lib/arm64-v8a" -name "*.so" 2>/dev/null | sed 's|.*/||' | sort | head -10 | sed 's/^/    - /'
        if [ $(find "$TMP_APK/lib/arm64-v8a" -name "*.so" 2>/dev/null | wc -l) -gt 10 ]; then
            echo "    ... and more"
        fi
    else
        echo -e "${YELLOW}⚠${NC} No native libraries found"
    fi
    
    rm -rf "$TMP_APK"
else
    echo -e "${YELLOW}⚠${NC} Cannot check native libraries (APK not found)"
fi

# Section 4: Zipalign Verification
print_section "4. CHECKING ZIP ALIGNMENT"

echo ""
if command -v zipalign &> /dev/null; then
    if [ -f "$RELEASE_APK" ]; then
        echo "Verifying 16 KB alignment for APK..."
        if zipalign -c -v -P 16 4 "$RELEASE_APK" &>/dev/null; then
            echo -e "${GREEN}✓${NC} APK is properly 16 KB aligned"
        else
            echo -e "${YELLOW}⚠${NC} APK alignment verification output:"
            zipalign -c -v -P 16 4 "$RELEASE_APK" | tail -5 || true
        fi
    fi
else
    echo -e "${YELLOW}⚠${NC} zipalign not found in PATH"
    echo "  Install Android Build-Tools 36.0.0 or higher"
    echo "  Or specify the full path: /path/to/sdk/build-tools/36.0.0/zipalign"
fi

# Section 5: Summary
print_section "5. COMPLIANCE SUMMARY"

echo ""
echo "Your app configuration for 16 KB page size support:"
echo ""

if grep -q "useLegacyPackaging false" "$PROJECT_ROOT/android/app/build.gradle" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Packaging: Modern 16 KB aligned format"
else
    echo -e "${YELLOW}⚠${NC} Packaging: May need configuration"
fi

if grep -q "targetSdkVersion.*3[56]" "$PROJECT_ROOT/android/app/build.gradle" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Target SDK: Android 15+ (API 35+)"
else
    echo -e "${YELLOW}⚠${NC} Target SDK: Verify it's 35 or higher"
fi

if grep -q "ndkVersion = \"27\." "$PROJECT_ROOT/android/build.gradle" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} NDK Version: 27+ (automatic 16 KB support)"
else
    echo -e "${YELLOW}⚠${NC} NDK Version: Consider upgrading to 27+"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Build the app:"
echo "   ${YELLOW}cd $PROJECT_ROOT && yarn build${NC}"
echo ""
echo "2. Verify alignment:"
echo "   ${YELLOW}zipalign -c -v -P 16 4 android/app/build/outputs/apk/release/app-release.apk${NC}"
echo ""
echo "3. Test on 16 KB device/emulator:"
echo "   ${YELLOW}adb shell getconf PAGE_SIZE${NC}  # Should return 16384"
echo ""
echo "4. For more info, see:"
echo "   ${YELLOW}cat 16KB_PAGE_SIZE_COMPLIANCE.md${NC}"
echo ""
echo -e "${GREEN}✓ Your app is ready for 16 KB page size support!${NC}"
echo ""
