# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ============================================================================
# BUNDLE SIZE OPTIMIZATION RULES
# ============================================================================

# Keep React Native classes (required)
-keep class com.facebook.react.** { *; }
-keep interface com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep Firebase classes
-keep class com.google.firebase.** { *; }
-keep interface com.google.firebase.** { *; }
-keep class io.invertase.firebase.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep navigation classes
-keep class com.react_native_navigation.** { *; }
-keep class com.swmansion.rnscreens.** { *; }

# Keep gesture handler
-keep class com.swmansion.gesturehandler.** { *; }

# Keep Redux/Redux Toolkit
-keep class com.reduxjs.** { *; }

# Keep enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelable implementations
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep R classes (Android resources)
-keepclassmembers class **.R$* {
    public static <fields>;
}

# Don't warn about missing library classes
-dontwarn java.lang.reflect.AnnotatedType
-dontwarn java.lang.reflect.AnnotatedElement
-dontwarn sun.misc.Unsafe
-dontwarn com.google.common.**
-dontwarn javax.annotation.**
-dontwarn org.apache.commons.**
-dontwarn org.slf4j.**

# Keep annotations
-keepattributes *Annotation*,Exceptions,InnerClasses,EnclosingMethod,Signature

# Optimization flags
-optimizationpasses 5
-verbose


