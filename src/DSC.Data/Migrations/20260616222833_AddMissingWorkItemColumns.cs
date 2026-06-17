using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSC.Data.Migrations
{
    // backfill WorkItems columns that exist in the model snapshot but were never
    // emitted by an earlier migration (ActivityType, CpcCode, DirectorCode,
    // ReasonCode). Idempotent: uses IF NOT EXISTS so it is a no-op on any DB
    // that has been manually repaired or already includes the columns.
    public partial class AddMissingWorkItemColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE `WorkItems` ADD COLUMN IF NOT EXISTS `ActivityType` longtext NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE `WorkItems` ADD COLUMN IF NOT EXISTS `CpcCode` longtext NULL;");
            migrationBuilder.Sql("ALTER TABLE `WorkItems` ADD COLUMN IF NOT EXISTS `DirectorCode` longtext NULL;");
            migrationBuilder.Sql("ALTER TABLE `WorkItems` ADD COLUMN IF NOT EXISTS `ReasonCode` longtext NULL;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE `WorkItems` DROP COLUMN IF EXISTS `ReasonCode`;");
            migrationBuilder.Sql("ALTER TABLE `WorkItems` DROP COLUMN IF EXISTS `DirectorCode`;");
            migrationBuilder.Sql("ALTER TABLE `WorkItems` DROP COLUMN IF EXISTS `CpcCode`;");
            migrationBuilder.Sql("ALTER TABLE `WorkItems` DROP COLUMN IF EXISTS `ActivityType`;");
        }
    }
}
