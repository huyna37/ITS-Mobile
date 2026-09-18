# ==============================================================================
# Dockerfile cho ITS Mobile VEC API (.NET 10.0) tích hợp tự động đóng gói OTA
# - Tự động bundle mã nguồn React Native (Android: index.android.bundle, iOS: main.jsbundle)
# - Tự động nén bundle-android.zip, bundle-ios.zip, bundle.zip
# - Tự động sinh OTA version mới theo timestamp (YYYYMMDD.HHmm) lưu vào Database
# - Tự động đồng bộ bundle vào wwwroot/ota (kể cả khi mount volume từ host)
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

# Các đối số tùy chỉnh khi build (mặc định 'auto' sẽ sinh theo timestamp YYYYMMDD.HHmm)
ARG OTA_VERSION=auto
ARG OTA_NOTES=""
ARG CACHEBUST=""

# Thực thi bundling cho cả Android và iOS, nén file zip và sinh version.json
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
    echo "===> [4/4] Generating OTA version.json for Database..." && \
    node /workspace/tools/generate-ota.js /output

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

# Lưu trữ các file OTA bundle và version.json vào cả wwwroot/ota và ota-dist
COPY --from=ota-builder /output/ /app/publish/wwwroot/ota/
COPY --from=ota-builder /output/ /app/publish/ota-dist/

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

# Copy sản phẩm đã publish từ stage build (đã chứa wwwroot/ota và ota-dist)
COPY --from=build /app/publish .

# Tạo entrypoint tự động đồng bộ bundle sang wwwroot/ota khi container chạy
RUN printf '#!/bin/sh\nmkdir -p /app/wwwroot/ota\ncp -rf /app/ota-dist/* /app/wwwroot/ota/ 2>/dev/null || true\nexec dotnet ITS-MOBILE-API.dll "$@"\n' > /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Khởi chạy dịch vụ API qua entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
