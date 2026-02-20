using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSC.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentUserModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Department_User",
                columns: table => new
                {
                    UserempId = table.Column<int>(type: "int", nullable: false),
                    DepartmentdeptID = table.Column<int>(type: "int", nullable: false),
                    startDate = table.Column<DateTime>(type: "date", nullable: false),
                    endDate = table.Column<DateTime>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Department_User", x => new { x.UserempId, x.DepartmentdeptID, x.startDate });
                })
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Department_User");
        }
    }
}
