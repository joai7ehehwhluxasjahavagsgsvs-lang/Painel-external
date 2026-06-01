buildscript {
    ext {
        compileSdkVersion = 34
        buildToolsVersion = "34.0.0"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
