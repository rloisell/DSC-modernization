using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSC.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBudgetModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "BudgetId",
                table: "WorkItems",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "BudgetId",
                table: "ExpenseCategories",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci");

            migrationBuilder.CreateTable(
                name: "Budgets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Description = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Budgets", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_WorkItems_BudgetId",
                table: "WorkItems",
                column: "BudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_ExpenseCategories_BudgetId",
                table: "ExpenseCategories",
                column: "BudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_Description",
                table: "Budgets",
                column: "Description",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ExpenseCategories_Budgets_BudgetId",
                table: "ExpenseCategories",
                column: "BudgetId",
                principalTable: "Budgets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkItems_Budgets_BudgetId",
                table: "WorkItems",
                column: "BudgetId",
                principalTable: "Budgets",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExpenseCategories_Budgets_BudgetId",
                table: "ExpenseCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkItems_Budgets_BudgetId",
                table: "WorkItems");

            migrationBuilder.DropTable(
                name: "Budgets");

            migrationBuilder.DropIndex(
                name: "IX_WorkItems_BudgetId",
                table: "WorkItems");

            migrationBuilder.DropIndex(
                name: "IX_ExpenseCategories_BudgetId",
                table: "ExpenseCategories");

            migrationBuilder.DropColumn(
                name: "BudgetId",
                table: "WorkItems");

            migrationBuilder.DropColumn(
                name: "BudgetId",
                table: "ExpenseCategories");
        }
    }
}
