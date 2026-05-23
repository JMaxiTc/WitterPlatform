# Construccion de imagen
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar el archivo de proyecto y descargar dependencias
COPY ["Witter.Api.csproj", "./"]
RUN dotnet restore "Witter.Api.csproj"

# Copiar todo el código fuente y compilar
COPY . .
RUN dotnet build "Witter.Api.csproj" -c Release -o /app/build
RUN dotnet publish "Witter.Api.csproj" -c Release -o /app/publish

# Capa de Producción
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Witter.Api.dll"]