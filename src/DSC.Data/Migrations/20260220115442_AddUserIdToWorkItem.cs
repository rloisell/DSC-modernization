using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSC.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToWorkItem : Migration
    {
        /// <inheritdoc />
        // no-op: WorkItems.UserId column, IX_WorkItems_UserId index, and FK already exist from MapJavaModel
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
