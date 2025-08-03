@echo off
echo 🚀 Building Money Manager APK...
echo.

REM Set environment for Java 17 compatibility
set JAVA_OPTS=--add-opens=java.base/java.util=ALL-UNNAMED --add-opens=java.base/java.lang.reflect=ALL-UNNAMED --add-opens=java.base/java.text=ALL-UNNAMED --add-opens=java.desktop/java.awt.font=ALL-UNNAMED

REM Navigate to android directory
cd android

echo 📦 Building debug APK...
gradlew.bat assembleDebug --warning-mode all

if %ERRORLEVEL% == 0 (
    echo.
    echo ✅ APK built successfully!
    echo 📱 APK Location: android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo 📋 Next Steps:
    echo 1. Transfer the APK file to your Android device
    echo 2. Enable "Unknown Sources" in Settings
    echo 3. Install the APK
    echo.
    pause
) else (
    echo.
    echo ❌ Build failed. Trying alternative method...
    echo.
    echo 🔧 Using compatibility flags...
    gradlew.bat assembleDebug --stacktrace --warning-mode all -Dorg.gradle.jvmargs="-Xmx2g -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8 --add-opens=java.base/java.util=ALL-UNNAMED"
    
    if %ERRORLEVEL% == 0 (
        echo.
        echo ✅ APK built successfully with compatibility mode!
        echo 📱 APK Location: android\app\build\outputs\apk\debug\app-debug.apk
    ) else (
        echo.
        echo ❌ Local build failed due to Java compatibility.
        echo 💡 Please use the online APK builder method instead.
        echo 📖 Check ANDROID_APK_GUIDE.md for instructions.
    )
    echo.
    pause
)

cd ..