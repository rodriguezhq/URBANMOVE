using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace URBANMOVE_Proyecto.Server.Migrations
{
    /// <inheritdoc />
    public partial class updateSRID : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<LineString>(
                name: "Recorrido",
                table: "Rutas",
                type: "LINESTRING",
                nullable: false,
                oldClrType: typeof(LineString),
                oldType: "LINESTRING")
                .Annotation("Sqlite:Srid", 4326);

            migrationBuilder.AlterColumn<Point>(
                name: "Ubicacion",
                table: "Paradas",
                type: "POINT",
                nullable: false,
                oldClrType: typeof(Point),
                oldType: "POINT")
                .Annotation("Sqlite:Srid", 4326);

            migrationBuilder.AlterColumn<Point>(
                name: "Ubicacion",
                table: "ComercioAliado",
                type: "POINT",
                nullable: false,
                oldClrType: typeof(Point),
                oldType: "POINT")
                .Annotation("Sqlite:Srid", 4326);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<LineString>(
                name: "Recorrido",
                table: "Rutas",
                type: "LINESTRING",
                nullable: false,
                oldClrType: typeof(LineString),
                oldType: "LINESTRING")
                .OldAnnotation("Sqlite:Srid", 4326);

            migrationBuilder.AlterColumn<Point>(
                name: "Ubicacion",
                table: "Paradas",
                type: "POINT",
                nullable: false,
                oldClrType: typeof(Point),
                oldType: "POINT")
                .OldAnnotation("Sqlite:Srid", 4326);

            migrationBuilder.AlterColumn<Point>(
                name: "Ubicacion",
                table: "ComercioAliado",
                type: "POINT",
                nullable: false,
                oldClrType: typeof(Point),
                oldType: "POINT")
                .OldAnnotation("Sqlite:Srid", 4326);
        }
    }
}
