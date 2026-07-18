using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace URBANMOVE_Proyecto.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Sqlite:InitSpatialMetaData", true);

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Nombres = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Apellidos = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    DNI = table.Column<string>(type: "TEXT", maxLength: 8, nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Activo = table.Column<bool>(type: "INTEGER", nullable: false),
                    UserName = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "INTEGER", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: true),
                    SecurityStamp = table.Column<string>(type: "TEXT", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "TEXT", nullable: true),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "INTEGER", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ComercioAliado",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    Direccion = table.Column<string>(type: "TEXT", maxLength: 250, nullable: false),
                    Ubicacion = table.Column<Point>(type: "POINT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComercioAliado", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Lineas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lineas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Paradas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Ubicacion = table.Column<Point>(type: "POINT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Paradas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UnidadesTransporte",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Placa = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Capacidad = table.Column<int>(type: "INTEGER", nullable: false),
                    Activa = table.Column<bool>(type: "INTEGER", nullable: false),
                    VelocidadPromedioKmH = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnidadesTransporte", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RoleId = table.Column<string>(type: "TEXT", nullable: false),
                    ClaimType = table.Column<string>(type: "TEXT", nullable: true),
                    ClaimValue = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    ClaimType = table.Column<string>(type: "TEXT", nullable: true),
                    ClaimValue = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "TEXT", nullable: false),
                    ProviderKey = table.Column<string>(type: "TEXT", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "TEXT", nullable: true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    RoleId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    LoginProvider = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Value = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Incidentes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    descripcion = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Ubicacion = table.Column<Point>(type: "POINT", nullable: false),
                    ImagenUrl = table.Column<string>(type: "TEXT", maxLength: 250, nullable: true),
                    Categoria = table.Column<int>(type: "INTEGER", nullable: false),
                    Estado = table.Column<int>(type: "INTEGER", nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UsuarioId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidentes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Incidentes_AspNetUsers_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Rutas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Recorrido = table.Column<LineString>(type: "LINESTRING", nullable: false),
                    LineaId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rutas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Rutas_Lineas_LineaId",
                        column: x => x.LineaId,
                        principalTable: "Lineas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RutaParadas",
                columns: table => new
                {
                    RutaId = table.Column<int>(type: "INTEGER", nullable: false),
                    ParadaId = table.Column<int>(type: "INTEGER", nullable: false),
                    Orden = table.Column<int>(type: "INTEGER", nullable: false),
                    TiempoDescansoSegundos = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RutaParadas", x => new { x.RutaId, x.ParadaId });
                    table.ForeignKey(
                        name: "FK_RutaParadas_Paradas_ParadaId",
                        column: x => x.ParadaId,
                        principalTable: "Paradas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RutaParadas_Rutas_RutaId",
                        column: x => x.RutaId,
                        principalTable: "Rutas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalidasProgramadas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FechaHoraSalida = table.Column<DateTime>(type: "TEXT", nullable: false),
                    FechaHoraLlegadaEstimada = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Estado = table.Column<int>(type: "INTEGER", nullable: false),
                    TipoProgramacion = table.Column<int>(type: "INTEGER", nullable: false),
                    DiaSemana = table.Column<int>(type: "INTEGER", nullable: true),
                    FechaFinRecurrencia = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    RutaId = table.Column<int>(type: "INTEGER", nullable: false),
                    UnidadTransporteId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalidasProgramadas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalidasProgramadas_Rutas_RutaId",
                        column: x => x.RutaId,
                        principalTable: "Rutas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SalidasProgramadas_UnidadesTransporte_UnidadTransporteId",
                        column: x => x.UnidadTransporteId,
                        principalTable: "UnidadesTransporte",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tickets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Codigo = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    FechaReserva = table.Column<DateTime>(type: "TEXT", nullable: false),
                    FechaValidacion = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Estado = table.Column<int>(type: "INTEGER", nullable: false),
                    UsuarioId = table.Column<string>(type: "TEXT", nullable: false),
                    SalidaId = table.Column<int>(type: "INTEGER", nullable: false),
                    UnidadId = table.Column<int>(type: "INTEGER", nullable: false),
                    OperadorId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tickets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tickets_AspNetUsers_OperadorId",
                        column: x => x.OperadorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tickets_AspNetUsers_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tickets_SalidasProgramadas_SalidaId",
                        column: x => x.SalidaId,
                        principalTable: "SalidasProgramadas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tickets_UnidadesTransporte_UnidadId",
                        column: x => x.UnidadId,
                        principalTable: "UnidadesTransporte",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PuntosLedgers",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Cantidad = table.Column<int>(type: "INTEGER", nullable: false),
                    Tipo = table.Column<int>(type: "INTEGER", nullable: false),
                    Descripcion = table.Column<string>(type: "TEXT", maxLength: 300, nullable: true),
                    Fecha = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UsuarioId = table.Column<string>(type: "TEXT", nullable: false),
                    TicketId = table.Column<int>(type: "INTEGER", nullable: true),
                    ComercioId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PuntosLedgers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PuntosLedgers_AspNetUsers_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PuntosLedgers_ComercioAliado_ComercioId",
                        column: x => x.ComercioId,
                        principalTable: "ComercioAliado",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PuntosLedgers_Tickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "Tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ComercioAliado_Nombre",
                table: "ComercioAliado",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Incidentes_UsuarioId",
                table: "Incidentes",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Lineas_Nombre",
                table: "Lineas",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Paradas_Nombre",
                table: "Paradas",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PuntosLedgers_ComercioId",
                table: "PuntosLedgers",
                column: "ComercioId");

            migrationBuilder.CreateIndex(
                name: "IX_PuntosLedgers_TicketId",
                table: "PuntosLedgers",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_PuntosLedgers_UsuarioId",
                table: "PuntosLedgers",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_RutaParadas_ParadaId",
                table: "RutaParadas",
                column: "ParadaId");

            migrationBuilder.CreateIndex(
                name: "IX_Rutas_LineaId",
                table: "Rutas",
                column: "LineaId");

            migrationBuilder.CreateIndex(
                name: "IX_Rutas_Nombre",
                table: "Rutas",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalidasProgramadas_RutaId",
                table: "SalidasProgramadas",
                column: "RutaId");

            migrationBuilder.CreateIndex(
                name: "IX_SalidasProgramadas_UnidadTransporteId",
                table: "SalidasProgramadas",
                column: "UnidadTransporteId");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_OperadorId",
                table: "Tickets",
                column: "OperadorId");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_SalidaId",
                table: "Tickets",
                column: "SalidaId");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_UnidadId",
                table: "Tickets",
                column: "UnidadId");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_UsuarioId",
                table: "Tickets",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_UnidadesTransporte_Placa",
                table: "UnidadesTransporte",
                column: "Placa",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "Incidentes");

            migrationBuilder.DropTable(
                name: "PuntosLedgers");

            migrationBuilder.DropTable(
                name: "RutaParadas");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "ComercioAliado");

            migrationBuilder.DropTable(
                name: "Tickets");

            migrationBuilder.DropTable(
                name: "Paradas");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "SalidasProgramadas");

            migrationBuilder.DropTable(
                name: "Rutas");

            migrationBuilder.DropTable(
                name: "UnidadesTransporte");

            migrationBuilder.DropTable(
                name: "Lineas");
        }
    }
}
