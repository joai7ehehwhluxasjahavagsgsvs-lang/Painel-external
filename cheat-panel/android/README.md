# Painel Cheat - Android App

App nativo Android que carrega o painel web em uma WebView.

## Requisitos

- Android SDK 24+ (minSdk)
- Android Studio 2022.1+
- Gradle 8.1+
- Java 11+

## Estrutura

```
cheat-panel/android/
├── app/
│   ├── src/main/
│   │   ├── java/com/painelcheat/app/
│   │   │   └── MainActivity.java
│   │   ├── res/
│   │   │   ├── layout/activity_main.xml
│   │   │   ├── values/strings.xml
│   │   │   └── values/themes.xml
│   │   ├── assets/www/
│   │   │   ├── index.html
│   │   │   ├── dashboard.html
│   │   │   ├── css/style.css
│   │   │   └── js/
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
├── settings.gradle.kts
└── build.sh
```

## Como compilar

### Via Android Studio
1. Abra `cheat-panel/android/` como um projeto Android
2. Aguarde o Gradle sincronizar
3. Build → Make Project
4. Run → Run 'app'

### Via linha de comando
```bash
cd cheat-panel/android
chmod +x build.sh
./build.sh
```

Ou diretamente:
```bash
cd cheat-panel/android
./gradlew build
./gradlew installDebug  # Instala no emulador/device conectado
```

## Gerar APK de release

```bash
./gradlew assembleRelease
```

O APK estará em: `app/build/outputs/apk/release/app-release.apk`

## Permissões

O app solicita:
- `INTERNET` — Para comunicação com APIs
- `ACCESS_NETWORK_STATE` — Para verificar conexão

## Notas

- O painel web é carregado localmente via `WebView` a partir dos assets
- JavaScript está habilitado para funcionamento completo do painel
- O app é compatível com Android 7.0+ (API 24)
