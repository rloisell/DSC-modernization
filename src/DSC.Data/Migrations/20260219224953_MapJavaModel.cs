using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSC.Data.Migrations
{
    /// <inheritdoc />
    public partial class MapJavaModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActivityCode",
                table: "WorkItems",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "ActualDuration",
                table: "WorkItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Date",
                table: "WorkItems",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndTime",
                table: "WorkItems",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LegacyActivityId",
                table: "WorkItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NetworkNumber",
                table: "WorkItems",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "PlannedDuration",
                table: "WorkItems",
                type: "time(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartTime",
                table: "WorkItems",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProjectNo",
                table: "Projects",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActivityCode",
                table: "WorkItems");

            migrationBuilder.DropColumn(
                name: "ActualDuration",
                table: "WorkItems");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "WorkItems");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "WorkItems");

            migrationBuilder.DropColumn(
                name: "LegacyActivityId",
                table: "WorkItems");

            migrationBuilder.DropColumn(
                name: "NetworkNumber",
                table: "WorkItems");

            migrationBuilder.DropColumn(
                name: "PlannedDuration",
                table: "WorkItems");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "WorkItems");

            migrationBuilder.DropColumn(
                name: "ProjectNo",
                table: "Projects");
        }
    }
}
