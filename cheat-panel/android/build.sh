#!/bin/bash
# Painel Cheat Android Build Script

set -e

ANDROID_SDK="${ANDROID_HOME:-$HOME/Android/Sdk}"

if [ ! -d "$ANDROID_SDK" ]; then
    echo "❌ Android SDK not found at $ANDROID_SDK"
    echo "Set ANDROID_HOME environment variable to your Android SDK path"
    exit 1
fi

echo "📱 Building Painel Cheat Android App..."
echo "🔨 Using Android SDK: $ANDROID_SDK"

cd "$(dirname "$0")"

# Build APK
./gradlew build

echo "✅ Build complete!"
echo "📦 APK location: app/build/outputs/apk/debug/app-debug.apk"
