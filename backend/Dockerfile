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

# Railway injects PORT; default to 5000 for local
ENV PORT=5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE ${PORT}

# Use shell form so $PORT is expanded at runtime
CMD ASPNETCORE_URLS=http://+:${PORT} dotnet SportActivityOrganizer.API.dll
