using System;
using Microsoft.EntityFrameworkCore;
using DSC.Data.Models;

namespace DSC.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<WorkItem> WorkItems => Set<WorkItem>();
        public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();
        public DbSet<ProjectAssignment> ProjectAssignments => Set<ProjectAssignment>();
        public DbSet<ExternalIdentity> ExternalIdentities => Set<ExternalIdentity>();
        public DbSet<Position> Positions => Set<Position>();
        public DbSet<Department> Departments => Set<Department>();
        public DbSet<Budget> Budgets => Set<Budget>();
        public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
        public DbSet<ExpenseOption> ExpenseOptions => Set<ExpenseOption>();
        public DbSet<ActivityCode> ActivityCodes => Set<ActivityCode>();
        public DbSet<NetworkNumber> NetworkNumbers => Set<NetworkNumber>();
        public DbSet<ProjectActivityOption> ProjectActivityOptions => Set<ProjectActivityOption>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(b =>
            {
                b.HasKey(u => u.Id);
                b.Property(u => u.EmpId);
                b.HasIndex(u => u.Username).IsUnique();
                b.Property(u => u.Email).IsRequired();
                b.HasOne(u => u.Role).WithMany().HasForeignKey(u => u.RoleId).OnDelete(DeleteBehavior.SetNull);
                b.HasOne(u => u.Position).WithMany().HasForeignKey(u => u.PositionId).OnDelete(DeleteBehavior.SetNull);
                b.HasOne(u => u.Department).WithMany().HasForeignKey(u => u.DepartmentId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Role>(b =>
            {
                b.HasKey(r => r.Id);
                b.HasIndex(r => r.Name).IsUnique();
                b.Property(r => r.Name).IsRequired();
            });

            modelBuilder.Entity<Project>(b =>
            {
                b.HasKey(p => p.Id);
                b.Property(p => p.Name).IsRequired();
                b.Property(p => p.IsActive).HasDefaultValue(true);
            });

            modelBuilder.Entity<WorkItem>(b =>
            {
                b.HasKey(w => w.Id);
                b.HasOne(w => w.Project).WithMany(p => p.WorkItems).HasForeignKey(w => w.ProjectId).OnDelete(DeleteBehavior.Cascade);
                b.HasOne(w => w.Budget).WithMany(bu => bu.WorkItems).HasForeignKey(w => w.BudgetId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<TimeEntry>(b =>
            {
                b.HasKey(t => t.Id);
                b.HasOne(t => t.WorkItem).WithMany(w => w.TimeEntries).HasForeignKey(t => t.WorkItemId).OnDelete(DeleteBehavior.Cascade);
                b.HasOne(t => t.User).WithMany(u => u.TimeEntries).HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProjectAssignment>(b =>
            {
                b.HasKey("ProjectId", "UserId");
                b.HasOne(pa => pa.Project).WithMany(p => p.Assignments).HasForeignKey(pa => pa.ProjectId).OnDelete(DeleteBehavior.Cascade);
                b.HasOne(pa => pa.User).WithMany(u => u.ProjectAssignments).HasForeignKey(pa => pa.UserId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserAuth>(b =>
            {
                b.HasKey(ua => ua.UserName);
                // Legacy mapping: do not enforce FK to User.Id here because legacy EmpId
                // is a numeric employee identifier that doesn't match the User primary key (Guid).
                b.Property(ua => ua.EmpId);
            });

            modelBuilder.Entity<ExternalIdentity>(b =>
            {
                b.HasKey(e => e.Id);
                b.HasIndex(e => new { e.Provider, e.Subject }).IsUnique();
                b.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Position>(b =>
            {
                b.HasKey(p => p.Id);
                b.HasIndex(p => p.Title).IsUnique();
            });

            modelBuilder.Entity<Department>(b =>
            {
                b.HasKey(d => d.Id);
                b.HasIndex(d => d.Name).IsUnique();
            });

            modelBuilder.Entity<Budget>(b =>
            {
                b.HasKey(bu => bu.Id);
                b.HasIndex(bu => bu.Description).IsUnique();
            });

            modelBuilder.Entity<ExpenseCategory>(b =>
            {
                b.HasKey(c => c.Id);
                b.HasIndex(c => c.Name).IsUnique();
                b.HasOne(c => c.Budget).WithMany(bu => bu.ExpenseCategories).HasForeignKey(c => c.BudgetId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ExpenseOption>(b =>
            {
                b.HasKey(o => o.Id);
                b.HasOne(o => o.Category).WithMany(c => c.Options).HasForeignKey(o => o.ExpenseCategoryId).OnDelete(DeleteBehavior.Cascade);
                b.HasIndex(o => new { o.ExpenseCategoryId, o.Name }).IsUnique();
            });

            modelBuilder.Entity<ActivityCode>(b =>
            {
                b.HasKey(a => a.Id);
                b.HasIndex(a => a.Code).IsUnique();
            });

            modelBuilder.Entity<NetworkNumber>(b =>
            {
                b.HasKey(n => n.Id);
                b.HasIndex(n => n.Number).IsUnique();
            });

            modelBuilder.Entity<ProjectActivityOption>(b =>
            {
                b.HasKey(p => new { p.ProjectId, p.ActivityCodeId, p.NetworkNumberId });
                b.HasOne(p => p.Project).WithMany().HasForeignKey(p => p.ProjectId).OnDelete(DeleteBehavior.Cascade);
                b.HasOne(p => p.ActivityCode).WithMany().HasForeignKey(p => p.ActivityCodeId).OnDelete(DeleteBehavior.Cascade);
                b.HasOne(p => p.NetworkNumber).WithMany().HasForeignKey(p => p.NetworkNumberId).OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
