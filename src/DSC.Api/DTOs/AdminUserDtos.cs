/*
 * AdminUserDtos.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Data Transfer Objects for admin user management: read (AdminUserDto),
 * create (AdminUserCreateRequest), and update (AdminUserUpdateRequest) shapes.
 * AI-assisted: DTO scaffolding; reviewed and directed by Ryan Loiselle.
 */

using System;

namespace DSC.Api.DTOs
{
    public class AdminUserDto
    {
        public Guid Id { get; set; }
        public int? EmpId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public bool IsActive { get; set; }
        public Guid? RoleId { get; set; }
        public Guid? PositionId { get; set; }
        public Guid? DepartmentId { get; set; }
    }

    public class AdminUserCreateRequest
    {
        public int? EmpId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Password { get; set; }
        public Guid? RoleId { get; set; }
        public Guid? PositionId { get; set; }
        public Guid? DepartmentId { get; set; }
    }

    public class AdminUserUpdateRequest
    {
        public int? EmpId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Password { get; set; }
        public Guid? RoleId { get; set; }
        public Guid? PositionId { get; set; }
        public Guid? DepartmentId { get; set; }
    }
}
