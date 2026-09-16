# ==========================================================
# Dockerfile cho ITS Mobile VEC API (.NET 10.0)
# Vị trí: Bên trong thư mục ITS-MOBILE-API
# Cách build: cd ITS-MOBILE-API && docker build -t its-mobile-api .
# Cách chạy : docker run -d -p 32281:32281 --name its-mobile-api its-mobile-api
# ==========================================================

# Stage 1: Build mã nguồn với .NET 10 SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy file .csproj và restore
COPY ["ITS-MOBILE-API.csproj", "./"]
RUN dotnet restore "ITS-MOBILE-API.csproj"

# Copy toàn bộ mã nguồn
COPY . .

# Publish bản Release
RUN dotnet publish "ITS-MOBILE-API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime Image với .NET 10 ASP.NET Core
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Cấu hình môi trường và cổng lắng nghe HTTP (lắng nghe cả 32281 và 8080)
ENV ASPNETCORE_HTTP_PORTS=32281;8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 32281
EXPOSE 8080

# Copy sản phẩm đã publish từ stage build
COPY --from=build /app/publish .

# Khởi chạy dịch vụ API
ENTRYPOINT ["dotnet", "ITS-MOBILE-API.dll"]
