using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace URBANMOVE_Proyecto.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddEstadoAprobacionOperador : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EstadoAprobacion",
                table: "AspNetUsers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "MotivoRechazo",
                table: "AspNetUsers",
                type: "TEXT",
                maxLength: 300,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstadoAprobacion",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "MotivoRechazo",
                table: "AspNetUsers");
        }
    }
}
