# ==============================================================================
# Dockerfile cho ITS Mobile VEC API (.NET 10.0) tích hợp tự động đóng gói OTA
# - Tự động bundle mã nguồn React Native (Android: index.android.bundle, iOS: main.jsbundle)
# - Tự động nén bundle-android.zip, bundle-ios.zip, bundle.zip
# - Tự động sinh OTA version mới theo timestamp (ví dụ: 1.8.YYYYMMDD.HHmm)
# - Tự động cập nhật manifest.json & manifest-ios.json vào wwwroot/ota
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Đóng gói OTA bundle cho React Native & tự động sinh version mới
# ------------------------------------------------------------------------------
FROM node:20-bookworm-slim AS ota-builder

# Cài đặt công cụ zip để nén bundle
RUN apt-get update && apt-get install -y --no-install-recommends zip && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Copy file định nghĩa package để restore dependency cache
COPY package.json ./
COPY ITS-MOBILE/package.json ./ITS-MOBILE/

# Cài đặt thư viện phụ thuộc cho React Native Metro Bundler
WORKDIR /workspace/ITS-MOBILE
RUN npm install --legacy-peer-deps

# Copy toàn bộ mã nguồn ứng dụng Mobile và công cụ sinh OTA
WORKDIR /workspace
COPY ITS-MOBILE/ ./ITS-MOBILE/
COPY tools/ ./tools/
COPY ITS-MOBILE-API/wwwroot/ota/ ./manifest-ref/

# Các đối số tùy chỉnh khi build (mặc định 'auto' sẽ sinh theo timestamp)
ARG OTA_VERSION=auto
ARG OTA_NOTES=""
ARG CACHEBUST=""

# Thực thi bundling cho cả Android và iOS, nén file zip và sinh manifest phiên bản mới
WORKDIR /workspace/ITS-MOBILE
RUN mkdir -p /output && \
    echo "===> [1/4] Bundling Android JS Bundle..." && \
    npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output /output/index.android.bundle --assets-dest /output && \
    echo "===> [2/4] Bundling iOS JS Bundle..." && \
    npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output /output/main.jsbundle --assets-dest /output && \
    echo "===> [3/4] Zipping Bundles (bundle-android.zip, bundle.zip, bundle-ios.zip)..." && \
    cd /output && \
    zip -j -9 bundle-android.zip index.android.bundle && \
    cp bundle-android.zip bundle.zip && \
    zip -j -9 bundle-ios.zip main.jsbundle && \
    echo "===> [4/4] Generating OTA Manifests with new version..." && \
    node /workspace/tools/generate-ota.js /output /workspace/manifest-ref/manifest.json

# ------------------------------------------------------------------------------
# Stage 2: Build mã nguồn backend với .NET 10 SDK
# ------------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy file .csproj để restore cache dependencies
COPY ["ITS-MOBILE-API/ITS-MOBILE-API.csproj", "ITS-MOBILE-API/"]
RUN dotnet restore "ITS-MOBILE-API/ITS-MOBILE-API.csproj"

# Copy toàn bộ mã nguồn của ITS-MOBILE-API
COPY ITS-MOBILE-API/ ITS-MOBILE-API/
WORKDIR "/src/ITS-MOBILE-API"

# Publish bản Release tối ưu hiệu năng
RUN dotnet publish "ITS-MOBILE-API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Ghi đè toàn bộ các file OTA bundle và manifest mới sinh từ Stage 1 vào wwwroot/ota
COPY --from=ota-builder /output/ /app/publish/wwwroot/ota/

# ------------------------------------------------------------------------------
# Stage 3: Runtime Image nhẹ với .NET 10 ASP.NET Core
# ------------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Cấu hình môi trường và cổng lắng nghe HTTP (lắng nghe cả 32281 và 8080)
ENV ASPNETCORE_HTTP_PORTS=32281;8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 32281
EXPOSE 8080

# Copy sản phẩm đã publish từ stage build (đã chứa wwwroot/ota với version mới)
COPY --from=build /app/publish .

# Khởi chạy dịch vụ API
ENTRYPOINT ["dotnet", "ITS-MOBILE-API.dll"]
