#!/bin/bash

# Ultimate Flux Build + Sign Script (Fixed)
# Does: npm build → cap sync → Gradle release build → sign + verify
# Saves final signed APK to Desktop with random name

set -e  # Stop on any error

# === CONFIGURATION ===
PROJECT_DIR="/home/dhyan/jeeisnear/flux"
ANDROID_DIR="$PROJECT_DIR/android"
# FIXED: Point to the correct APK output name
INPUT_UNSIGNED_APK="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
KEYSTORE="$PROJECT_DIR/android/app/release-key.keystore"
KEY_ALIAS="flux_alias"
KEYSTORE_PASS="123456"          
DESKTOP_DIR="$HOME/Desktop"
TEMP_DIR="/tmp"

echo "🚀 Starting full Flux release build..."

# 1. Go to project and build web assets
cd "$PROJECT_DIR"
echo "→ Running npm run build..."
npm run build

# 2. Sync with Capacitor
echo "→ Running npx cap sync..."
npx cap sync

# 3. Build release APK with Gradle
cd "$ANDROID_DIR"
echo "→ Building release APK with Gradle..."
./gradlew assembleRelease

# Check if unsigned APK was created
if [[ ! -f "$INPUT_UNSIGNED_APK" ]]; then
    echo "❌ Error: Unsigned APK not found at:"
    echo "   $INPUT_UNSIGNED_APK"
    echo "   Gradle build may have failed. Check the output above."
    exit 1
fi

# 4. Generate random filename
RANDOM_NAME=$(tr -dc a-z0-9 </dev/urandom | head -c 10)
TEMP_APK="$TEMP_DIR/$RANDOM_NAME.apk"
FINAL_APK="$DESKTOP_DIR/$RANDOM_NAME.apk"

echo "→ Generated filename: $RANDOM_NAME.apk"

# 5. Zipalign
echo "→ Running zipalign..."
zipalign -p -v 4 "$INPUT_UNSIGNED_APK" "$TEMP_APK"

# 6. Sign the APK
echo "→ Signing with apksigner..."
apksigner sign \
    --ks "$KEYSTORE" \
    --ks-key-alias "$KEY_ALIAS" \
    --ks-pass pass:"$KEYSTORE_PASS" \
    --out "$FINAL_APK" \
    "$TEMP_APK"

# 7. Verify
echo "→ Verifying signature..."
apksigner verify --verbose "$FINAL_APK"

# 8. Final alignment check
echo "→ Final zipalign check..."
zipalign -c -v 4 "$FINAL_APK"

# 9. Cleanup
rm -f "$TEMP_APK"

echo ""
echo "⚡ Lightning build complete!"
echo "✅ Signed & verified APK ready at:"
echo "   $FINAL_APK"
echo ""
echo "You can now install it or upload it anywhere! 🚀"
