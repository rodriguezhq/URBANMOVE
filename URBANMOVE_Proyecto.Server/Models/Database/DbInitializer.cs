using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace URBANMOVE_Proyecto.Server.Models.Database
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(AppDbContext db, RoleManager<IdentityRole> roleManager, UserManager<Usuario> userManager)
        {
            // Migraciones pendientes
            await db.Database.MigrateAsync();

            // ── Seed de usuarios/roles (solo si no existen) ───────────────────────
            if (!await db.Users.AnyAsync())
            {
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

                var adminUser = new Usuario
                {
                    UserName = "admin",
                    Nombres = "Admin",
                    Apellidos = "URBANMOVE",
                    DNI = "00000000",
                    Email = "admin@admin.com",
                    Activo = true,
                    EstadoAprobacion = EstadoAprobacion.Aprobado,
                };

                var ciudadanoUser = new Usuario
                {
                    UserName = "ciudadano",
                    Nombres = "Juan",
                    Apellidos = "Pérez",
                    DNI = "11111111",
                    Email = "ciudadano@ciudadano.com",
                    Activo = true,
                    EstadoAprobacion = EstadoAprobacion.Aprobado,
                };

                var operadorUser = new Usuario
                {
                    UserName = "operador",
                    Nombres = "Carlos",
                    Apellidos = "López",
                    DNI = "22222222",
                    Email = "operador@operador.com",
                    Activo = true,
                    EstadoAprobacion = EstadoAprobacion.Aprobado,
                };

                var operadorPendienteUser = new Usuario
                {
                    UserName = "operador.pendiente",
                    Nombres = "Rosa",
                    Apellidos = "Quispe",
                    DNI = "33333333",
                    Email = "operador.pendiente@urbanmove.com",
                    Activo = false,
                    EstadoAprobacion = EstadoAprobacion.Pendiente,
                };

                var result = await userManager.CreateAsync(adminUser, "admin123");
                if (result.Succeeded)
                    await userManager.AddToRoleAsync(adminUser, Roles.Admin);

                result = await userManager.CreateAsync(ciudadanoUser, "ciudadano123");
                if (result.Succeeded)
                    await userManager.AddToRoleAsync(ciudadanoUser, Roles.Ciudadano);

                result = await userManager.CreateAsync(operadorUser, "operador123");
                if (result.Succeeded)
                    await userManager.AddToRoleAsync(operadorUser, Roles.Operador);

                result = await userManager.CreateAsync(operadorPendienteUser, "operador123");
                if (result.Succeeded)
                    await userManager.AddToRoleAsync(operadorPendienteUser, Roles.Operador);
            }

            // ── Seed RF-02: siempre verifica si faltan datos de navegación ────────
            await SeedNavegacionAsync(db);

            // ── Seed RF-05: comercios aliados + puntos de prueba ──────────────────
            await SeedFidelizacionAsync(db);
        }

        /// <summary>
        /// Inserta comercios aliados de prueba y un historial de puntos ya "ganados"
        /// para el usuario 'ciudadano', ya que todavía no existe el flujo real de
        /// validar-ticket que dispararía RegistrarPuntosPorTicketValidadoAsync.
        /// Solo inserta si no existe ningún ComercioAliado en la BD.
        /// </summary>
        private static async Task SeedFidelizacionAsync(AppDbContext db)
        {
            if (await db.ComercioAliado.AnyAsync())
                return;

            var gf = NetTopologySuite.NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);

            var comercio1 = new ComercioAliado
            {
                Nombre = "Café Verde Huancayo",
                Direccion = "Jr. Real 456, Huancayo",
                Ubicacion = gf.CreatePoint(new Coordinate(-75.2097, -12.0628))
            };
            var comercio2 = new ComercioAliado
            {
                Nombre = "Bicicletería El Tambo",
                Direccion = "Av. Ferrocarril 789, El Tambo",
                Ubicacion = gf.CreatePoint(new Coordinate(-75.1981, -12.0498))
            };

            db.ComercioAliado.AddRange(comercio1, comercio2);
            await db.SaveChangesAsync();

            // Puntos de prueba para el usuario 'ciudadano', simulando que ya
            // validó un par de rutas (sin depender del flujo real de tickets).
            var ciudadano = await db.Users.FirstOrDefaultAsync(u => u.UserName == "ciudadano");
            if (ciudadano is not null)
            {
                db.PuntosLedgers.AddRange(
                    new PuntosLedger
                    {
                        UsuarioId = ciudadano.Id,
                        Usuario = ciudadano,
                        Cantidad = 60,
                        Tipo = TipoMovimiento.Ganados,
                        Descripcion = "Ruta validada (dato de prueba): Centro → El Tambo",
                        Fecha = DateTime.UtcNow.AddDays(-2)
                    },
                    new PuntosLedger
                    {
                        UsuarioId = ciudadano.Id,
                        Usuario = ciudadano,
                        Cantidad = 55,
                        Tipo = TipoMovimiento.Ganados,
                        Descripcion = "Ruta validada (dato de prueba): Chilca → Huancán",
                        Fecha = DateTime.UtcNow.AddDays(-1)
                    }
                );
                await db.SaveChangesAsync();
            }
        }


        /// <summary>
        /// Inserta datos de demostración para el módulo RF-02.
        /// Paradas con coordenadas reales de Huancayo, Perú (SRID 4326).
        /// Solo inserta si no existe ninguna Linea en la BD.
        /// </summary>
        private static async Task SeedNavegacionAsync(AppDbContext db)
        {
            // Guard: si ya hay líneas, los datos de navegación ya fueron insertados
            if (await db.Lineas.AnyAsync())
                return;

            var gf = NetTopologySuite.NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);

            // ── Líneas ─────────────────────────────────────────────────────────────
            var lineaA = new Linea { Nombre = "Línea A – Centro/El Tambo" };
            var lineaB = new Linea { Nombre = "Línea B – Chilca/Huancán" };
            db.Lineas.AddRange(lineaA, lineaB);

            // ── Unidades ───────────────────────────────────────────────────────────
            var unidad1 = new UnidadTransporte
            {
                Placa = "ABC-123",
                Capacidad = 40,
                Activa = true,
                VelocidadPromedioKmH = 30
            };
            var unidad2 = new UnidadTransporte
            {
                Placa = "XYZ-456",
                Capacidad = 35,
                Activa = true,
                VelocidadPromedioKmH = 28
            };
            db.UnidadesTransporte.AddRange(unidad1, unidad2);

            // ── Paradas (coordenadas reales de Huancayo) ───────────────────────────
            var pTerminal = new Parada { Nombre = "Terminal Terraza", Ubicacion = gf.CreatePoint(new Coordinate(-75.2103, -12.0694)) };
            var pPlaza = new Parada { Nombre = "Plaza de Huancayo", Ubicacion = gf.CreatePoint(new Coordinate(-75.2097, -12.0628)) };
            var pRealPlaza = new Parada { Nombre = "Real Plaza Huancayo", Ubicacion = gf.CreatePoint(new Coordinate(-75.2042, -12.0563)) };
            var pElTambo = new Parada { Nombre = "El Tambo – Av. Ferrocarril", Ubicacion = gf.CreatePoint(new Coordinate(-75.1981, -12.0498)) };
            var pHospital = new Parada { Nombre = "Hospital Daniel Alcides", Ubicacion = gf.CreatePoint(new Coordinate(-75.2071, -12.0652)) };
            var pChilca = new Parada { Nombre = "Chilca – Mercado", Ubicacion = gf.CreatePoint(new Coordinate(-75.2165, -12.0748)) };
            var pHuancan = new Parada { Nombre = "Huancán – Plaza", Ubicacion = gf.CreatePoint(new Coordinate(-75.1897, -12.0830)) };
            var pUniversidad = new Parada { Nombre = "UNCP – Universidad", Ubicacion = gf.CreatePoint(new Coordinate(-75.2130, -12.0582)) };
            var pMayorista = new Parada { Nombre = "Mercado Mayorista", Ubicacion = gf.CreatePoint(new Coordinate(-75.2078, -12.0720)) };
            var pCajamarquilla = new Parada { Nombre = "Cajamarquilla – Paradero", Ubicacion = gf.CreatePoint(new Coordinate(-75.1954, -12.0461)) };

            db.Paradas.AddRange(pTerminal, pPlaza, pRealPlaza, pElTambo, pHospital,
                                pChilca, pHuancan, pUniversidad, pMayorista, pCajamarquilla);

            // Guardamos para obtener Ids de paradas, líneas y unidades
            await db.SaveChangesAsync();

            // ── Rutas Línea A ──────────────────────────────────────────────────────
            var rutaA1 = new Ruta
            {
                Nombre = "Centro → El Tambo (Av. Ferrocarril)",
                Linea = lineaA,
                Recorrido = gf.CreateLineString([
                    new Coordinate(-75.2103, -12.0694),
                    new Coordinate(-75.2097, -12.0628),
                    new Coordinate(-75.2042, -12.0563),
                    new Coordinate(-75.1981, -12.0498),
                ]),
            };
            db.Rutas.Add(rutaA1);
            await db.SaveChangesAsync();

            db.RutaParadas.AddRange(
                new RutaParada { RutaId = rutaA1.Id, ParadaId = pTerminal.Id, Ruta = rutaA1, Parada = pTerminal, Orden = 1 },
                new RutaParada { RutaId = rutaA1.Id, ParadaId = pPlaza.Id, Ruta = rutaA1, Parada = pPlaza, Orden = 2 },
                new RutaParada { RutaId = rutaA1.Id, ParadaId = pRealPlaza.Id, Ruta = rutaA1, Parada = pRealPlaza, Orden = 3 },
                new RutaParada { RutaId = rutaA1.Id, ParadaId = pElTambo.Id, Ruta = rutaA1, Parada = pElTambo, Orden = 4 }
            );

            var rutaA2 = new Ruta
            {
                Nombre = "El Tambo → Centro (Retorno)",
                Linea = lineaA,
                Recorrido = gf.CreateLineString([
                    new Coordinate(-75.1981, -12.0498),
                    new Coordinate(-75.2042, -12.0563),
                    new Coordinate(-75.2097, -12.0628),
                    new Coordinate(-75.2103, -12.0694),
                ]),
            };
            db.Rutas.Add(rutaA2);
            await db.SaveChangesAsync();

            db.RutaParadas.AddRange(
                new RutaParada { RutaId = rutaA2.Id, ParadaId = pElTambo.Id, Ruta = rutaA2, Parada = pElTambo, Orden = 1 },
                new RutaParada { RutaId = rutaA2.Id, ParadaId = pRealPlaza.Id, Ruta = rutaA2, Parada = pRealPlaza, Orden = 2 },
                new RutaParada { RutaId = rutaA2.Id, ParadaId = pPlaza.Id, Ruta = rutaA2, Parada = pPlaza, Orden = 3 },
                new RutaParada { RutaId = rutaA2.Id, ParadaId = pTerminal.Id, Ruta = rutaA2, Parada = pTerminal, Orden = 4 }
            );

            // ── Rutas Línea B ──────────────────────────────────────────────────────
            var rutaB1 = new Ruta
            {
                Nombre = "Chilca → Huancán (Circular)",
                Linea = lineaB,
                Recorrido = gf.CreateLineString([
                    new Coordinate(-75.2165, -12.0748),
                    new Coordinate(-75.2103, -12.0694),
                    new Coordinate(-75.2078, -12.0720),
                    new Coordinate(-75.1897, -12.0830),
                ]),
            };
            db.Rutas.Add(rutaB1);
            await db.SaveChangesAsync();

            db.RutaParadas.AddRange(
                new RutaParada { RutaId = rutaB1.Id, ParadaId = pChilca.Id, Ruta = rutaB1, Parada = pChilca, Orden = 1 },
                new RutaParada { RutaId = rutaB1.Id, ParadaId = pTerminal.Id, Ruta = rutaB1, Parada = pTerminal, Orden = 2 },
                new RutaParada { RutaId = rutaB1.Id, ParadaId = pMayorista.Id, Ruta = rutaB1, Parada = pMayorista, Orden = 3 },
                new RutaParada { RutaId = rutaB1.Id, ParadaId = pHuancan.Id, Ruta = rutaB1, Parada = pHuancan, Orden = 4 }
            );

            var rutaB2 = new Ruta
            {
                Nombre = "Universidad → Cajamarquilla",
                Linea = lineaB,
                Recorrido = gf.CreateLineString([
                    new Coordinate(-75.2130, -12.0582),
                    new Coordinate(-75.2097, -12.0628),
                    new Coordinate(-75.2071, -12.0652),
                    new Coordinate(-75.1954, -12.0461),
                ]),
            };
            db.Rutas.Add(rutaB2);
            await db.SaveChangesAsync();

            db.RutaParadas.AddRange(
                new RutaParada { RutaId = rutaB2.Id, ParadaId = pUniversidad.Id, Ruta = rutaB2, Parada = pUniversidad, Orden = 1 },
                new RutaParada { RutaId = rutaB2.Id, ParadaId = pPlaza.Id, Ruta = rutaB2, Parada = pPlaza, Orden = 2 },
                new RutaParada { RutaId = rutaB2.Id, ParadaId = pHospital.Id, Ruta = rutaB2, Parada = pHospital, Orden = 3 },
                new RutaParada { RutaId = rutaB2.Id, ParadaId = pCajamarquilla.Id, Ruta = rutaB2, Parada = pCajamarquilla, Orden = 4 }
            );

            await db.SaveChangesAsync();

            // ── Salidas programadas (siempre futuras: desde mañana por 3 días) ─────
            // Usar "mañana" como base garantiza que las fechas sean futuras
            // sin importar la hora en que se ejecute el seed.
            var manana = DateTime.UtcNow.Date.AddDays(1);
            var salidasSeed = new List<SalidaProgramada>();

            for (int dia = 0; dia < 3; dia++)
            {
                var base_ = manana.AddDays(dia);
                salidasSeed.AddRange([
                    // Línea A – Ruta A1: 3 frecuencias (mañana, mediodía, tarde)
                    new SalidaProgramada { Ruta = rutaA1, UnidadTransporte = unidad1, FechaHoraSalida = base_.AddHours(6),    FechaHoraLlegadaEstimada = base_.AddHours(6).AddMinutes(45),    Estado = EstadioSalida.Programada, TipoProgramacion = TipoProgramacion.Diaria },
                    new SalidaProgramada { Ruta = rutaA1, UnidadTransporte = unidad2, FechaHoraSalida = base_.AddHours(12),   FechaHoraLlegadaEstimada = base_.AddHours(12).AddMinutes(50),   Estado = EstadioSalida.Programada, TipoProgramacion = TipoProgramacion.Diaria },
                    new SalidaProgramada { Ruta = rutaA1, UnidadTransporte = unidad1, FechaHoraSalida = base_.AddHours(18),   FechaHoraLlegadaEstimada = base_.AddHours(18).AddMinutes(45),   Estado = EstadioSalida.Programada, TipoProgramacion = TipoProgramacion.Diaria },
                    // Línea A – Ruta A2 (retorno): 2 frecuencias
                    new SalidaProgramada { Ruta = rutaA2, UnidadTransporte = unidad2, FechaHoraSalida = base_.AddHours(8),    FechaHoraLlegadaEstimada = base_.AddHours(8).AddMinutes(45),    Estado = EstadioSalida.Programada, TipoProgramacion = TipoProgramacion.Diaria },
                    new SalidaProgramada { Ruta = rutaA2, UnidadTransporte = unidad1, FechaHoraSalida = base_.AddHours(19),   FechaHoraLlegadaEstimada = base_.AddHours(19).AddMinutes(45),   Estado = EstadioSalida.Programada, TipoProgramacion = TipoProgramacion.Diaria },
                    // Línea B – Ruta B1: 2 frecuencias
                    new SalidaProgramada { Ruta = rutaB1, UnidadTransporte = unidad1, FechaHoraSalida = base_.AddHours(7),    FechaHoraLlegadaEstimada = base_.AddHours(7).AddMinutes(55),    Estado = EstadioSalida.Programada, TipoProgramacion = TipoProgramacion.Diaria },
                    new SalidaProgramada { Ruta = rutaB1, UnidadTransporte = unidad2, FechaHoraSalida = base_.AddHours(15),   FechaHoraLlegadaEstimada = base_.AddHours(15).AddMinutes(55),   Estado = EstadioSalida.Programada, TipoProgramacion = TipoProgramacion.Diaria },
                    // Línea B – Ruta B2: 2 frecuencias
                    new SalidaProgramada { Ruta = rutaB2, UnidadTransporte = unidad2, FechaHoraSalida = base_.AddHours(9).AddMinutes(30),  FechaHoraLlegadaEstimada = base_.AddHours(9).AddMinutes(70),  Estado = EstadioSalida.Programada, TipoProgramacion = TipoProgramacion.Semanal, DiaSemana = base_.DayOfWeek },
                    new SalidaProgramada { Ruta = rutaB2, UnidadTransporte = unidad1, FechaHoraSalida = base_.AddHours(16).AddMinutes(30), FechaHoraLlegadaEstimada = base_.AddHours(16).AddMinutes(70), Estado = EstadioSalida.Programada, TipoProgramacion = TipoProgramacion.Diaria },
                ]);
            }

            db.SalidasProgramadas.AddRange(salidasSeed);
            await db.SaveChangesAsync();
        }
    }
}