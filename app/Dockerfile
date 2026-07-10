FROM ghcr.io/cirruslabs/flutter:stable AS build

WORKDIR /app

COPY pubspec.yaml pubspec.lock ./

RUN flutter pub get

COPY . .

RUN flutter build apk --release

FROM alpine:latest

COPY --from=build /app/build/app/outputs/flutter-apk/app-release.apk /output/app-release.apk

CMD ["cp", "/output/app-release.apk", "/output/"]
