using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSC.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentUserModel : Migration
    {
        /// <inheritdoc />
        // no-op: Department_User table already exists from MapJavaModel
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
