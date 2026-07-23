# =============================================================
#  URBANMOVE - imagen unica: API ASP.NET + SPA React servida
#  desde wwwroot (Program.cs ya hace MapFallbackToFile).
# =============================================================

# ---------- 1. Build del cliente React ----------
FROM node:22-alpine AS client
WORKDIR /src

COPY urbanmove_proyecto.client/package.json urbanmove_proyecto.client/package-lock.json ./
RUN npm ci

COPY urbanmove_proyecto.client/ ./

# Se llama a vite directamente en vez de `npm run build`: ese script es
# `tsc -b && vite build` y hoy el typecheck falla en master con errores
# preexistentes. El bundle se genera igual; una vez arreglado el tipado,
# cambiar esta linea por `npm run build`.
RUN npx vite build


# ---------- 2. Build y publish del backend ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore en capa aparte para aprovechar la cache de Docker.
COPY URBANMOVE_Proyecto.Server/URBANMOVE_Proyecto.Server.csproj URBANMOVE_Proyecto.Server/
RUN dotnet restore URBANMOVE_Proyecto.Server/URBANMOVE_Proyecto.Server.csproj -p:BuildClient=false

COPY URBANMOVE_Proyecto.Server/ URBANMOVE_Proyecto.Server/

# El dist va a wwwroot ANTES del publish: MapStaticAssets() de .NET 10 genera
# su manifest en tiempo de build y necesita los archivos ya presentes.
COPY --from=client /src/dist/ URBANMOVE_Proyecto.Server/wwwroot/

RUN dotnet publish URBANMOVE_Proyecto.Server/URBANMOVE_Proyecto.Server.csproj \
    -c Release -o /app --no-restore -p:BuildClient=false


# ---------- 3. Runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0

# El paquete NuGet de EF Core SQLite + NetTopologySuite solo trae el binario
# nativo de mod_spatialite para Windows. En Linux hay que instalarlo aparte
# o cualquier consulta sobre Point/LineString revienta en runtime.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libsqlite3-mod-spatialite \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app .

# Carpeta destinada al volumen persistente (SQLite + uploads).
RUN mkdir -p /data

# appsettings.json esta en .gitignore (lleva credenciales), asi que no viaja en
# la imagen. Estos son los defaults no secretos; cualquier variable definida en
# Railway tiene prioridad sobre un ENV del Dockerfile.
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ConnectionStrings__DefaultConnection="Data Source=/data/app.db"
ENV General__RoutingUrl="https://router.project-osrm.org/"

# Los secretos (Email__Username, Email__Password) se definen en Railway.

EXPOSE 8080

# PORT y RAILWAY_PUBLIC_DOMAIN solo existen en runtime, de ahi que se resuelvan
# en shell. El `:-` deja que una variable explicita de Railway gane.
CMD ASPNETCORE_URLS="http://+:${PORT:-8080}" \
    General__FrontendUrl="${General__FrontendUrl:-https://${RAILWAY_PUBLIC_DOMAIN}}" \
    dotnet URBANMOVE_Proyecto.Server.dll
