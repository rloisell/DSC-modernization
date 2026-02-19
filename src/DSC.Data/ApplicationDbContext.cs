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
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<WorkItem> WorkItems => Set<WorkItem>();
        public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();
        public DbSet<ProjectAssignment> ProjectAssignments => Set<ProjectAssignment>();
        public DbSet<ExternalIdentity> ExternalIdentities => Set<ExternalIdentity>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(b =>
            {
                b.HasKey(u => u.Id);
                b.Property(u => u.EmpId);
                b.HasIndex(u => u.Username).IsUnique();
                b.Property(u => u.Email).IsRequired();
            });

            modelBuilder.Entity<Project>(b =>
            {
                b.HasKey(p => p.Id);
                b.Property(p => p.Name).IsRequired();
            });

            modelBuilder.Entity<WorkItem>(b =>
            {
                b.HasKey(w => w.Id);
                b.HasOne(w => w.Project).WithMany(p => p.WorkItems).HasForeignKey(w => w.ProjectId).OnDelete(DeleteBehavior.Cascade);
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
        }
    }
}
