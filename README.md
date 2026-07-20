# URBANMOVE

# Integrantes

- 
- 
- 
- 
- Poves Martinez Alessandro Piero
- 

# Requerimientos

Tecnologías:

- [dotnet 10](https://dotnet.microsoft.com/en-us/download/dotnet/10.0)
- [node](https://nodejs.org/en/download)
- [visual studio (opcional)](https://visualstudio.microsoft.com/es/)

# Estructura del Proyecto

## URBANMOVE_Proyecto.Server

Servidor backend en ASP.NET

## urbanmove_proyecto.client

Cliente frontend en React

# Ejecución del proyecto

## Automatica

Abrir el root del proyecto en visual studio, seleccionar el proyecto .Server como proyecto de inicio y presionar F5 o en la parte superior del IDE habrá un botton de play con el texto "https".

## Manual

Abrir en el terminal el proyecto .Server y .client, en .Server ejecutar

```bash
dotnet run
```

En la carpeta .client ejecutar

```bash
npm run dev

```

# Cambiar la estructura de la base de datos

se definen los modelos en .Server/Models/Database/

AppDbContext.cs es la declaración de la base de datos,

DbInitializer.cs es el seeder de la base de datos

Al añadir un nuevo modelo es necesario registrarlo en: `AppDbContext.cs`

La herramienta de migraciones de base de datos se instala con:

```bash
dotnet tool install --global dotnet-ef
```

Al modificar cualquier definición de la base de datos es necesario crear una migración, ejecutando el el proyecto .Server


```bash
dotnet ef migration add <nombre del a migración>

```

El sistema debería automaticamente ejecutar esta migracion al ejecutarse, pero tambien se puede hacer manualmente con

```
dotnet ef database update
```


