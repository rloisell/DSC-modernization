using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSC.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectActivityModel : Migration
    {
        /// <inheritdoc />
        // no-op: Expense_Activity and Project_Activity tables already exist from MapJavaModel
        protected override void Up(MigrationBuilder migrationBuilder)
        {
        }

        /// <inheritdoc />
        // no-op: nothing was created by this migration
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
