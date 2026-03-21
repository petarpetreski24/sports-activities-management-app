FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY src/SportActivityOrganizer.Domain/SportActivityOrganizer.Domain.csproj src/SportActivityOrganizer.Domain/
COPY src/SportActivityOrganizer.Application/SportActivityOrganizer.Application.csproj src/SportActivityOrganizer.Application/
COPY src/SportActivityOrganizer.Infrastructure/SportActivityOrganizer.Infrastructure.csproj src/SportActivityOrganizer.Infrastructure/
COPY src/SportActivityOrganizer.API/SportActivityOrganizer.API.csproj src/SportActivityOrganizer.API/
RUN dotnet restore src/SportActivityOrganizer.API/SportActivityOrganizer.API.csproj

# Copy everything and build
COPY . .
RUN dotnet publish src/SportActivityOrganizer.API/SportActivityOrganizer.API.csproj -c Release -o /app/publish --no-restore

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/wwwroot/uploads/profiles

COPY --from=build /app/publish .

EXPOSE 5000

ENTRYPOINT ["dotnet", "SportActivityOrganizer.API.dll"]
