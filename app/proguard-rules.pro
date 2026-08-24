# ProGuard configuration for NUR (com.nur.islamiccompanion)
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.room.* <methods>;
}
