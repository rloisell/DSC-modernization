using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSC.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEstimatedHoursToProjectAssignment : Migration
    {
        /// <inheritdoc />
        // adds EstimatedHours to ProjectAssignments and makes WorkItems.ProjectId nullable
        // All other operations (AddColumn ActivityType/CpcCode/DirectorCode/ReasonCode/UserId,
        // CreateTable Calendar/Calendar_Category/Category/CPC_Code/Director_Code/Reason_Code/Union,
        // CreateIndex IX_WorkItems_UserId, IX_Calendar_*, AddForeignKey FK_WorkItems_Users_UserId)
        // were removed — those objects already exist from the MapJavaModel migration.
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // AlterColumn: make WorkItems.ProjectId nullable (idempotent MODIFY COLUMN)
            migrationBuilder.AlterColumn<Guid>(
                name: "ProjectId",
                table: "WorkItems",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)")
                .OldAnnotation("Relational:Collation", "ascii_general_ci");

            // AI-assisted: add EstimatedHours column — only net-new operation in this migration
            migrationBuilder.AddColumn<decimal>(
                name: "EstimatedHours",
                table: "ProjectAssignments",
                type: "decimal(65,30)",
                nullable: true);
        }

        /// <inheritdoc />
        // reverses the two operations above
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstimatedHours",
                table: "ProjectAssignments");

            migrationBuilder.AlterColumn<Guid>(
                name: "ProjectId",
                table: "WorkItems",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)",
                oldNullable: true)
                .OldAnnotation("Relational:Collation", "ascii_general_ci");
        }
    }
}
