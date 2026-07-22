using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using URBANMOVE_Proyecto.Server.Services;
using URBANMOVE_Proyecto.Server.Models.DTO;

namespace URBANMOVE_Proyecto.Server.Models.Database
{
    /// <summary>
    /// Seeder de demostración de URBANMOVE. Genera un volumen grande y realista de
    /// datos para que TODOS los módulos (navegación, tickets/ocupación, incidentes,
    /// dashboard del operador y fidelización) se muestren poblados.
    ///
    /// Cada sección tiene su propio guard: si ya hay datos de ese tipo, no se vuelve
    /// a sembrar. Para regenerar todo desde cero: detén el server, borra el archivo
    /// <c>app.db</c> (y <c>app.db-shm</c>/<c>app.db-wal</c> si existen) y vuelve a
    /// ejecutar — las migraciones + este seed se aplican al arrancar.
    /// </summary>
    public static class DbInitializer
    {
        // Semilla fija ⇒ los datos "aleatorios" (ocupación, incidentes, puntos) son
        // reproducibles entre ejecuciones.
        private static readonly Random Rng = new(42);

        public static async Task InitializeAsync(AppDbContext db, RoleManager<IdentityRole> roleManager, UserManager<Usuario> userManager, RoutingService routingService)
        {
            // Migraciones pendientes
            await db.Database.MigrateAsync();

            // ── 1. Usuarios / roles ───────────────────────────────────────────────
            await SeedUsuariosAsync(db, userManager);

            // ── 2. Navegación: líneas, unidades, paradas, rutas y salidas ─────────
            await SeedNavegacionAsync(db, routingService);

            // ── 3. Tickets (ocupación de salidas) ─────────────────────────────────
            await SeedTicketsAsync(db);

            // ── 4. Incidentes geolocalizados ──────────────────────────────────────
            await SeedIncidentesAsync(db);

            // ── 5. Fidelización: comercios + historial de puntos ──────────────────
            await SeedFidelizacionAsync(db);
        }

        // ════════════════════════════════════════════════════════════════════════
        //  1. USUARIOS
        // ════════════════════════════════════════════════════════════════════════
        private static async Task SeedUsuariosAsync(AppDbContext db, UserManager<Usuario> userManager)
        {
            if (await db.Users.AnyAsync())
                return;

            // Roles
            foreach (var roleName in Roles.All)
            {
                if (!await db.Roles.AnyAsync(r => r.Name == roleName))
                {
                    db.Roles.Add(new IdentityRole
                    {
                        Name = roleName,
                        NormalizedName = roleName.ToUpper()
                    });
                }
            }
            await db.SaveChangesAsync();

            // Helper local para crear + asignar rol
            async Task Crear(string userName, string nombres, string apellidos, string dni,
                             string email, string rol, string pass,
                             bool activo = true, EstadoAprobacion estado = EstadoAprobacion.Aprobado,
                             int diasAntiguedad = 30, string? motivoRechazo = null)
            {
                var u = new Usuario
                {
                    UserName = userName,
                    Nombres = nombres,
                    Apellidos = apellidos,
                    DNI = dni,
                    Email = email,
                    Activo = activo,
                    EstadoAprobacion = estado,
                    EmailConfirmed = estado == EstadoAprobacion.Aprobado,
                    MotivoRechazo = motivoRechazo,
                    FechaRegistro = DateTime.UtcNow.AddDays(-diasAntiguedad)
                };
                var res = await userManager.CreateAsync(u, pass);
                if (res.Succeeded)
                    await userManager.AddToRoleAsync(u, rol);
            }

            // ── Cuentas "oficiales" (mismas credenciales de siempre) ──────────────
            await Crear("admin", "Admin", "URBANMOVE", "00000000", "admin@admin.com", Roles.Admin, "admin123", diasAntiguedad: 365);
            await Crear("ciudadano", "Juan", "Pérez", "11111111", "ciudadano@ciudadano.com", Roles.Ciudadano, "ciudadano123", diasAntiguedad: 200);
            await Crear("operador", "Carlos", "López", "22222222", "operador@operador.com", Roles.Operador, "operador123", diasAntiguedad: 180);
            await Crear("operador.pendiente", "Rosa", "Quispe", "33333333", "operador.pendiente@urbanmove.com", Roles.Operador, "operador123",
                        activo: false, estado: EstadoAprobacion.Pendiente, diasAntiguedad: 3);

            // ── Ciudadanos adicionales ────────────────────────────────────────────
            var ciudadanos = new (string user, string nom, string ape, string dni, int dias)[]
            {
                ("maria.flores",   "María",    "Flores",    "40112233", 150),
                ("pedro.canchari", "Pedro",    "Canchari",  "41223344", 120),
                ("lucia.ramos",    "Lucía",    "Ramos",     "42334455", 95),
                ("diego.huaman",   "Diego",    "Huamán",    "43445566", 80),
                ("ana.zarate",     "Ana",      "Zárate",    "44556677", 60),
                ("jose.mendoza",   "José",     "Mendoza",   "45667788", 45),
                ("carla.rojas",    "Carla",    "Rojas",     "46778899", 30),
                ("miguel.torres",  "Miguel",   "Torres",    "47889900", 20),
                ("sofia.paucar",   "Sofía",    "Páucar",    "48990011", 12),
                ("kevin.aliaga",   "Kevin",    "Aliaga",    "49001122", 5),
            };
            foreach (var c in ciudadanos)
                await Crear(c.user, c.nom, c.ape, c.dni, $"{c.user}@correo.com", Roles.Ciudadano, "ciudadano123", diasAntiguedad: c.dias);

            // ── Operadores adicionales (estados variados) ─────────────────────────
            await Crear("operador.norte", "Elena", "Vílchez", "50112233", "operador.norte@urbanmove.com", Roles.Operador, "operador123", diasAntiguedad: 140);
            await Crear("operador.sur", "Raúl", "Ccahuana", "51223344", "operador.sur@urbanmove.com", Roles.Operador, "operador123", diasAntiguedad: 110);
            await Crear("operador.pendiente2", "Marta", "Espinoza", "52334455", "operador.pendiente2@urbanmove.com", Roles.Operador, "operador123",
                        activo: false, estado: EstadoAprobacion.Pendiente, diasAntiguedad: 2);
            await Crear("operador.rechazado", "Fabián", "Rivera", "53445566", "operador.rechazado@urbanmove.com", Roles.Operador, "operador123",
                        activo: false, estado: EstadoAprobacion.Rechazado, diasAntiguedad: 15,
                        motivoRechazo: "Documentación de licencia de conducir vencida.");
        }

        // ════════════════════════════════════════════════════════════════════════
        //  2. NAVEGACIÓN (líneas, unidades, paradas, rutas, salidas)
        // ════════════════════════════════════════════════════════════════════════
        private static async Task SeedNavegacionAsync(AppDbContext db, RoutingService routingService)
        {
            if (await db.Lineas.AnyAsync())
                return;

            var gf = NetTopologySuite.NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);

            // ── Líneas ────────────────────────────────────────────────────────────
            var lineaA = new Linea { Nombre = "Línea A" };   // Centro ↔ El Tambo
            var lineaB = new Linea { Nombre = "Línea B" };   // Chilca ↔ Huancán
            var lineaC = new Linea { Nombre = "Línea C" };   // Universidad / UNCP
            var lineaD = new Linea { Nombre = "Línea D" };   // Circular Centro
            var lineaE = new Linea { Nombre = "Línea E" };   // Valle Sur
            var lineaF = new Linea { Nombre = "Línea F" };   // Nocturna
            db.Lineas.AddRange(lineaA, lineaB, lineaC, lineaD, lineaE, lineaF);

            // ── Unidades (15) ─────────────────────────────────────────────────────
            var unidades = new List<UnidadTransporte>();
            var placasBase = new[] { "URB", "WNK", "HYO", "TMB", "CHL" };
            var capacidades = new[] { 30, 35, 40, 45, 50, 28, 32, 38, 42, 48 };
            for (int i = 0; i < 15; i++)
            {
                var placa = $"{placasBase[i % placasBase.Length]}-{100 + i * 7}";
                unidades.Add(new UnidadTransporte
                {
                    Placa = placa,
                    Capacidad = capacidades[i % capacidades.Length],
                    Activa = i % 6 != 0, // ~2-3 fuera de servicio
                    VelocidadPromedioKmH = 24 + (i % 5) * 3 // 24..36
                });
            }
            db.UnidadesTransporte.AddRange(unidades);

            // ── Paradas (30, coordenadas del valle del Mantaro / Huancayo) ────────
            Parada P(string nombre, double lng, double lat) =>
                new() { Nombre = nombre, Ubicacion = gf.CreatePoint(new Coordinate(lng, lat)) };

            var paradas = new Dictionary<string, Parada>
            {
                // Centro de Huancayo
                ["terminal"]      = P("Terminal Terraza",              -75.2103, -12.0694),
                ["plaza"]         = P("Plaza Constitución",            -75.2097, -12.0628),
                ["catedral"]      = P("Catedral de Huancayo",          -75.2100, -12.0651),
                ["huamanmarca"]   = P("Parque Huamanmarca",            -75.2088, -12.0679),
                ["realplaza"]     = P("Real Plaza Huancayo",           -75.2042, -12.0563),
                ["hospital"]      = P("Hospital Daniel A. Carrión",    -75.2071, -12.0652),
                ["mayorista"]     = P("Mercado Mayorista",             -75.2078, -12.0720),
                ["coliseo"]       = P("Coliseo Wanka",                 -75.2050, -12.0690),
                ["giraldez"]      = P("Av. Giráldez",                  -75.2065, -12.0640),
                ["realcuadra8"]   = P("Jr. Real Cuadra 8",             -75.2085, -12.0610),
                // El Tambo (norte)
                ["eltambo"]       = P("El Tambo – Av. Ferrocarril",    -75.1981, -12.0498),
                ["uncp"]          = P("UNCP – Ciudad Universitaria",   -75.2130, -12.0582),
                ["identidad"]     = P("Parque de la Identidad Wanka",  -75.2015, -12.0470),
                ["cajamarquilla"] = P("Cajamarquilla – Paradero",      -75.1954, -12.0461),
                ["mcastilla"]     = P("Av. Mariscal Castilla",         -75.2040, -12.0520),
                ["modeloelt"]     = P("Mercado Modelo El Tambo",       -75.2005, -12.0535),
                ["umuto"]         = P("Umuto",                         -75.1930, -12.0430),
                ["vilcacoto"]     = P("Vilcacoto",                     -75.1850, -12.0380),
                // Chilca (sur)
                ["chilca"]        = P("Chilca – Mercado",              -75.2165, -12.0748),
                ["9diciembre"]    = P("Av. 9 de Diciembre",            -75.2140, -12.0780),
                ["ocopilla"]      = P("Ocopilla",                      -75.2050, -12.0820),
                ["azapampa"]      = P("Azapampa",                      -75.2200, -12.0900),
                // Valle sur
                ["huancan"]       = P("Huancán – Plaza",               -75.1897, -12.0830),
                ["huayucachi"]    = P("Huayucachi",                    -75.1970, -12.1050),
                ["viques"]        = P("Viques",                        -75.1900, -12.1180),
                ["pilcomayo"]     = P("Pilcomayo",                     -75.2350, -12.0560),
                // Norte / oeste
                ["sicaya"]        = P("Sicaya",                        -75.2500, -12.0300),
                ["cajas"]         = P("San Agustín de Cajas",          -75.2280, -12.0300),
                ["hualhuas"]      = P("Hualhuas",                      -75.2320, -12.0150),
                ["concepcion"]    = P("Salida a Concepción",           -75.2400, -12.0100),
            };
            db.Paradas.AddRange(paradas.Values);

            // Persistimos para obtener Ids
            await db.SaveChangesAsync();

            // ── Rutas ─────────────────────────────────────────────────────────────
            var rutas = new List<Ruta>();
            int ordenCounter;

            // Helper local: crea la ruta (calculando su recorrido) y sus RutaParadas
            async Task<Ruta> CrearRuta(string nombre, Linea linea, params Parada[] secuencia)
            {
                var recorrido = (await routingService.CalculateRouteAsync(
                    secuencia.Select(p => new WaypointDto { Lng = p.Ubicacion.X, Lat = p.Ubicacion.Y }).ToList()
                )).Geometry;

                var ruta = new Ruta { Nombre = nombre, Linea = linea, Recorrido = recorrido };
                db.Rutas.Add(ruta);
                await db.SaveChangesAsync(); // Id de la ruta

                // El recorrido usa la secuencia completa (incluyendo paradas repetidas,
                // p. ej. en rutas circulares), pero RutaParada tiene PK {RutaId, ParadaId},
                // así que solo registramos la primera aparición de cada parada.
                ordenCounter = 1;
                var paradasVistas = new HashSet<int>();
                foreach (var parada in secuencia)
                {
                    if (!paradasVistas.Add(parada.Id))
                        continue;

                    db.RutaParadas.Add(new RutaParada
                    {
                        RutaId = ruta.Id,
                        ParadaId = parada.Id,
                        Ruta = ruta,
                        Parada = parada,
                        Orden = ordenCounter++
                    });
                }
                await db.SaveChangesAsync();
                rutas.Add(ruta);
                return ruta;
            }

            var p = paradas; // alias corto

            // Línea A – Centro ↔ El Tambo
            var rA1 = await CrearRuta("A1 · Centro → El Tambo", lineaA, p["terminal"], p["plaza"], p["realplaza"], p["mcastilla"], p["eltambo"]);
            var rA2 = await CrearRuta("A2 · El Tambo → Centro", lineaA, p["eltambo"], p["mcastilla"], p["realplaza"], p["plaza"], p["terminal"]);
            var rA3 = await CrearRuta("A3 · Centro → Cajamarquilla", lineaA, p["terminal"], p["giraldez"], p["identidad"], p["cajamarquilla"]);

            // Línea B – Chilca ↔ Huancán
            var rB1 = await CrearRuta("B1 · Chilca → Huancán", lineaB, p["chilca"], p["terminal"], p["mayorista"], p["huancan"]);
            var rB2 = await CrearRuta("B2 · Huancán → Chilca", lineaB, p["huancan"], p["mayorista"], p["terminal"], p["chilca"]);
            var rB3 = await CrearRuta("B3 · Chilca → Azapampa", lineaB, p["chilca"], p["9diciembre"], p["azapampa"]);

            // Línea C – Universidad / UNCP
            var rC1 = await CrearRuta("C1 · UNCP → Centro", lineaC, p["uncp"], p["modeloelt"], p["realplaza"], p["plaza"], p["hospital"]);
            var rC2 = await CrearRuta("C2 · Centro → UNCP", lineaC, p["hospital"], p["plaza"], p["realplaza"], p["modeloelt"], p["uncp"]);

            // Línea D – Circular Centro
            var rD1 = await CrearRuta("D1 · Circular Centro", lineaD, p["terminal"], p["huamanmarca"], p["catedral"], p["giraldez"], p["realcuadra8"], p["coliseo"], p["terminal"]);

            // Línea E – Valle Sur
            var rE1 = await CrearRuta("E1 · Centro → Viques", lineaE, p["terminal"], p["mayorista"], p["huancan"], p["huayucachi"], p["viques"]);
            var rE2 = await CrearRuta("E2 · Centro → Sicaya", lineaE, p["terminal"], p["pilcomayo"], p["cajas"], p["sicaya"]);

            // Línea F – Nocturna
            var rF1 = await CrearRuta("F1 · Nocturna Norte", lineaF, p["terminal"], p["plaza"], p["identidad"], p["umuto"], p["vilcacoto"]);

            // ── Salidas programadas ──────────────────────────────────────────────
            // Estrategia: pasado (Finalizada), presente (EnCurso, algunas retrasadas),
            // futuro próximo (Programada) y algunas Cancelada. Genera muchísimo material
            // para el dashboard del operador.
            var salidas = new List<SalidaProgramada>();
            int u2 = 0;
            UnidadTransporte Unidad() => unidades[u2++ % unidades.Count];

            var ahora = DateTime.UtcNow;
            var todasLasRutas = rutas.ToArray();

            // (a) PASADO — últimos 4 días, salidas Finalizadas (para historial/tickets)
            for (int dia = 4; dia >= 1; dia--)
            {
                var baseDia = ahora.Date.AddDays(-dia);
                foreach (var ruta in todasLasRutas)
                {
                    foreach (var hora in new[] { 7, 13, 18 })
                    {
                        var salida = baseDia.AddHours(hora);
                        salidas.Add(new SalidaProgramada
                        {
                            Ruta = ruta,
                            UnidadTransporte = Unidad(),
                            FechaHoraSalida = salida,
                            FechaHoraLlegadaEstimada = salida.AddMinutes(45),
                            Estado = EstadioSalida.Finalizada,
                            TipoProgramacion = TipoProgramacion.Diaria
                        });
                    }
                }
            }

            // (b) PRESENTE — salidas EnCurso ahora mismo; algunas con llegada ya vencida
            //     ⇒ generan alertas de "Retraso" en el dashboard.
            for (int i = 0; i < todasLasRutas.Length; i++)
            {
                var ruta = todasLasRutas[i];
                bool retrasada = i % 3 == 0;
                var inicio = retrasada ? ahora.AddMinutes(-70) : ahora.AddMinutes(-15);
                salidas.Add(new SalidaProgramada
                {
                    Ruta = ruta,
                    UnidadTransporte = Unidad(),
                    FechaHoraSalida = inicio,
                    FechaHoraLlegadaEstimada = inicio.AddMinutes(50),
                    Estado = EstadioSalida.EnCurso,
                    TipoProgramacion = TipoProgramacion.Diaria
                });
            }

            // (c) FUTURO — próximos 10 días, muchas frecuencias Programadas
            for (int dia = 0; dia < 10; dia++)
            {
                var baseDia = ahora.Date.AddDays(dia);
                foreach (var ruta in todasLasRutas)
                {
                    // Frecuencias variadas por ruta
                    foreach (var (h, m) in new[] { (6, 0), (9, 30), (12, 0), (15, 30), (18, 0), (20, 30) })
                    {
                        var salida = baseDia.AddHours(h).AddMinutes(m);
                        if (salida <= ahora) continue; // solo futuras

                        // Una de cada ~11 se marca Cancelada (para variedad en el tablero)
                        var estado = Rng.Next(0, 11) == 0 ? EstadioSalida.Cancelada : EstadioSalida.Programada;

                        salidas.Add(new SalidaProgramada
                        {
                            Ruta = ruta,
                            UnidadTransporte = Unidad(),
                            FechaHoraSalida = salida,
                            FechaHoraLlegadaEstimada = salida.AddMinutes(40 + Rng.Next(0, 25)),
                            Estado = estado,
                            TipoProgramacion = TipoProgramacion.Diaria
                        });
                    }
                }
            }

            db.SalidasProgramadas.AddRange(salidas);
            await db.SaveChangesAsync();
        }

        // ════════════════════════════════════════════════════════════════════════
        //  3. TICKETS (ocupación de salidas)
        // ════════════════════════════════════════════════════════════════════════
        private static async Task SeedTicketsAsync(AppDbContext db)
        {
            if (await db.Tickets.AnyAsync())
                return;

            var ciudadanos = await db.Users
                .Where(u => u.DNI == "11111111" || u.DNI.StartsWith("4"))
                .ToListAsync();
            if (ciudadanos.Count == 0) return;

            var operadores = await db.Users
                .Where(u => u.DNI == "22222222" || u.DNI == "50112233" || u.DNI == "51223344")
                .ToListAsync();

            var salidas = await db.SalidasProgramadas
                .Include(s => s.UnidadTransporte)
                .ToListAsync();

            var tickets = new List<Ticket>();
            int codigoSeq = 1000;

            string NuevoCodigo() => $"UM-{codigoSeq++:D5}";

            foreach (var salida in salidas)
            {
                // Cuántos asientos "reservar" según el estado de la salida
                int cupo = salida.UnidadTransporte.Capacidad;
                int cantidad = salida.Estado switch
                {
                    EstadioSalida.Finalizada => Rng.Next((int)(cupo * 0.4), (int)(cupo * 0.9) + 1),
                    EstadioSalida.EnCurso => Rng.Next((int)(cupo * 0.5), (int)(cupo * 0.95) + 1),
                    EstadioSalida.Programada => Rng.Next(0, (int)(cupo * 0.75) + 1),
                    _ => 0 // Cancelada ⇒ sin tickets nuevos
                };

                for (int i = 0; i < cantidad; i++)
                {
                    var ciudadano = ciudadanos[Rng.Next(ciudadanos.Count)];

                    EstadoTicket estado;
                    DateTime? fechaValidacion = null;
                    string? operadorId = null;

                    switch (salida.Estado)
                    {
                        case EstadioSalida.Finalizada:
                            // La mayoría validados; algunos expiraron
                            if (Rng.Next(0, 10) < 8)
                            {
                                estado = EstadoTicket.Validado;
                                fechaValidacion = salida.FechaHoraSalida.AddMinutes(Rng.Next(-10, 5));
                                operadorId = operadores.Count > 0 ? operadores[Rng.Next(operadores.Count)].Id : null;
                            }
                            else estado = EstadoTicket.Expirado;
                            break;

                        case EstadioSalida.EnCurso:
                            if (Rng.Next(0, 10) < 7)
                            {
                                estado = EstadoTicket.Validado;
                                fechaValidacion = salida.FechaHoraSalida.AddMinutes(Rng.Next(-5, 5));
                                operadorId = operadores.Count > 0 ? operadores[Rng.Next(operadores.Count)].Id : null;
                            }
                            else estado = EstadoTicket.Reservado;
                            break;

                        default: // Programada
                            estado = Rng.Next(0, 10) < 1 ? EstadoTicket.Cancelado : EstadoTicket.Reservado;
                            break;
                    }

                    tickets.Add(new Ticket
                    {
                        Codigo = NuevoCodigo(),
                        FechaReserva = salida.FechaHoraSalida.AddHours(-Rng.Next(1, 48)),
                        FechaValidacion = fechaValidacion,
                        Estado = estado,
                        UsuarioId = ciudadano.Id,
                        SalidaId = salida.Id,
                        UnidadId = salida.UnidadTransporteId,
                        OperadorId = operadorId
                    });
                }
            }

            db.Tickets.AddRange(tickets);
            await db.SaveChangesAsync();
        }

        // ════════════════════════════════════════════════════════════════════════
        //  4. INCIDENTES
        // ════════════════════════════════════════════════════════════════════════
        private static async Task SeedIncidentesAsync(AppDbContext db)
        {
            if (await db.Incidentes.AnyAsync())
                return;

            var ciudadanos = await db.Users
                .Where(u => u.DNI == "11111111" || u.DNI.StartsWith("4"))
                .ToListAsync();
            if (ciudadanos.Count == 0) return;

            // La columna Incidentes.Ubicacion NO tiene HasSrid(4326) en el DbContext,
            // así que su SRID es 0 — igual que en IncidentesService. Debemos crear el
            // Point con SRID 0 para no violar la restricción geométrica de SpatiaLite.
            var gf = NetTopologySuite.NtsGeometryServices.Instance.CreateGeometryFactory(srid: 0);

            // (descripcion, lng, lat, categoria, estado, díasAtrás)
            var data = new (string desc, double lng, double lat, CategoriaIncidente cat, EstadoIncidente est, int dias)[]
            {
                ("Choque entre dos unidades en la Av. Ferrocarril", -75.1985, -12.0502, CategoriaIncidente.Accidente, EstadoIncidente.Pendiente, 0),
                ("Congestión severa a la altura del Mercado Mayorista", -75.2079, -12.0721, CategoriaIncidente.Congestion, EstadoIncidente.Pendiente, 0),
                ("Vidrio roto en paradero de la Plaza Constitución", -75.2098, -12.0629, CategoriaIncidente.Vandalismo, EstadoIncidente.Pendiente, 1),
                ("Semáforo malogrado genera embotellamiento en Giráldez", -75.2066, -12.0641, CategoriaIncidente.Congestion, EstadoIncidente.EnRevision, 1),
                ("Atropello leve cerca del Hospital Carrión", -75.2072, -12.0653, CategoriaIncidente.Accidente, EstadoIncidente.EnRevision, 2),
                ("Rayado de asientos en unidad de la Línea B", -75.2166, -12.0749, CategoriaIncidente.Vandalismo, EstadoIncidente.Resuelto, 3),
                ("Tráfico intenso por feria en El Tambo", -75.2006, -12.0536, CategoriaIncidente.Congestion, EstadoIncidente.Pendiente, 0),
                ("Volcadura de mototaxi en Chilca", -75.2141, -12.0781, CategoriaIncidente.Accidente, EstadoIncidente.Resuelto, 4),
                ("Pintas en el paradero de la UNCP", -75.2131, -12.0583, CategoriaIncidente.Vandalismo, EstadoIncidente.EnRevision, 2),
                ("Bloqueo por manifestación en Av. Mariscal Castilla", -75.2041, -12.0521, CategoriaIncidente.Congestion, EstadoIncidente.Pendiente, 1),
                ("Colisión menor en el óvalo de Huancán", -75.1898, -12.0831, CategoriaIncidente.Accidente, EstadoIncidente.Pendiente, 0),
                ("Robo de espejos en unidad estacionada en Ocopilla", -75.2051, -12.0821, CategoriaIncidente.Vandalismo, EstadoIncidente.Resuelto, 5),
                ("Embotellamiento en salida a Concepción", -75.2401, -12.0101, CategoriaIncidente.Congestion, EstadoIncidente.EnRevision, 2),
                ("Accidente por pista mojada en Pilcomayo", -75.2351, -12.0561, CategoriaIncidente.Accidente, EstadoIncidente.Pendiente, 1),
                ("Daño a caseta de paradero en Azapampa", -75.2201, -12.0901, CategoriaIncidente.Vandalismo, EstadoIncidente.Pendiente, 0),
            };

            var incidentes = data.Select((d, i) =>
            {
                var autor = ciudadanos[Rng.Next(ciudadanos.Count)];
                return new Incidente
                {
                    descripcion = d.desc,
                    Ubicacion = gf.CreatePoint(new Coordinate(d.lng, d.lat)),
                    Categoria = d.cat,
                    Estado = d.est,
                    ImagenUrl = i % 3 == 0 ? $"/uploads/incidentes/demo_{i + 1}.jpg" : null,
                    FechaRegistro = DateTime.UtcNow.AddDays(-d.dias).AddHours(-Rng.Next(0, 12)),
                    UsuarioId = autor.Id,
                    Usuario = autor
                };
            }).ToList();

            db.Incidentes.AddRange(incidentes);
            await db.SaveChangesAsync();
        }

        // ════════════════════════════════════════════════════════════════════════
        //  5. FIDELIZACIÓN (comercios + puntos)
        // ════════════════════════════════════════════════════════════════════════
        private static async Task SeedFidelizacionAsync(AppDbContext db)
        {
            if (await db.ComercioAliado.AnyAsync())
                return;

            var gf = NetTopologySuite.NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);

            ComercioAliado C(string nombre, string dir, double lng, double lat) =>
                new() { Nombre = nombre, Direccion = dir, Ubicacion = gf.CreatePoint(new Coordinate(lng, lat)) };

            var comercios = new List<ComercioAliado>
            {
                C("Café Verde Huancayo",     "Jr. Real 456, Huancayo",        -75.2097, -12.0628),
                C("Bicicletería El Tambo",   "Av. Ferrocarril 789, El Tambo", -75.1981, -12.0498),
                C("Librería Wanka",          "Jr. Ancash 120, Huancayo",      -75.2085, -12.0635),
                C("Panadería La Espiga",     "Av. Giráldez 340, Huancayo",    -75.2064, -12.0642),
                C("Farmacia San José",       "Calle Real 980, El Tambo",      -75.2010, -12.0530),
                C("Restaurante Mantaro",     "Jr. Puno 210, Huancayo",        -75.2090, -12.0655),
                C("Óptica Visión Andina",    "Av. Huancavelica 555, Chilca",  -75.2150, -12.0760),
                C("Gimnasio Fuerza Wanka",   "Av. Mariscal Castilla 1200",    -75.2038, -12.0518),
                C("Heladería Nieve Fresca",  "Jr. Loreto 88, Huancayo",       -75.2092, -12.0620),
                C("Ferretería El Constructor","Av. 9 de Diciembre 430, Chilca",-75.2142, -12.0782),
            };
            db.ComercioAliado.AddRange(comercios);
            await db.SaveChangesAsync();

            var ciudadanos = await db.Users
                .Where(u => u.DNI == "11111111" || u.DNI.StartsWith("4"))
                .ToListAsync();
            if (ciudadanos.Count == 0) return;

            var usuariosPorId = ciudadanos.ToDictionary(u => u.Id);

            // Tickets validados existentes ⇒ para vincular puntos "ganados" a tickets reales
            var ticketsValidados = await db.Tickets
                .Where(t => t.Estado == EstadoTicket.Validado)
                .OrderBy(t => t.FechaValidacion)
                .ToListAsync();

            var ledger = new List<PuntosLedger>();
            var descripcionesGanados = new[]
            {
                "Ruta validada: viaje en Línea A",
                "Ruta validada: viaje en Línea B",
                "Ruta validada: viaje en Línea C",
                "Bono por frecuencia semanal",
                "Ruta validada: viaje en Línea E",
            };

            // Puntos GANADOS: uno por cada ticket validado (10 pts), agrupado por usuario
            foreach (var t in ticketsValidados)
            {
                if (!usuariosPorId.TryGetValue(t.UsuarioId, out var autor)) continue;
                ledger.Add(new PuntosLedger
                {
                    UsuarioId = t.UsuarioId,
                    Usuario = autor,
                    Cantidad = 10,
                    Tipo = TipoMovimiento.Ganados,
                    Descripcion = descripcionesGanados[Rng.Next(descripcionesGanados.Length)],
                    Fecha = t.FechaValidacion ?? t.FechaReserva,
                    TicketId = t.Id
                });
            }

            // Algunos CANJES en comercios aliados (para que el saldo se vea "usado")
            foreach (var ciudadano in ciudadanos)
            {
                int canjes = Rng.Next(0, 3);
                for (int i = 0; i < canjes; i++)
                {
                    var comercio = comercios[Rng.Next(comercios.Count)];
                    ledger.Add(new PuntosLedger
                    {
                        UsuarioId = ciudadano.Id,
                        Usuario = ciudadano,
                        Cantidad = new[] { 20, 30, 40, 50 }[Rng.Next(4)],
                        Tipo = TipoMovimiento.Canjeados,
                        Descripcion = $"Canje en {comercio.Nombre}",
                        Fecha = DateTime.UtcNow.AddDays(-Rng.Next(1, 20)),
                        ComercioId = comercio.Id
                    });
                }
            }

            db.PuntosLedgers.AddRange(ledger);
            await db.SaveChangesAsync();
        }
    }
}
