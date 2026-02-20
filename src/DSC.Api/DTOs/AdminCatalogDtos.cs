using System;

namespace DSC.Api.DTOs
{
    public class RoleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class RoleCreateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class RoleUpdateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class PositionDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class PositionCreateRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class PositionUpdateRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class DepartmentDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ManagerName { get; set; }
        public bool IsActive { get; set; }
    }

    public class DepartmentCreateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? ManagerName { get; set; }
    }

    public class DepartmentUpdateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? ManagerName { get; set; }
        public bool IsActive { get; set; }
    }

    public class ExpenseCategoryDto
    {
        public Guid Id { get; set; }
        public Guid BudgetId { get; set; }
        public string? BudgetDescription { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class ExpenseCategoryCreateRequest
    {
        public Guid BudgetId { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class ExpenseCategoryUpdateRequest
    {
        public Guid BudgetId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class BudgetDto
    {
        public Guid Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class BudgetCreateRequest
    {
        public string Description { get; set; } = string.Empty;
    }

    public class BudgetUpdateRequest
    {
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class ExpenseOptionDto
    {
        public Guid Id { get; set; }
        public Guid ExpenseCategoryId { get; set; }
        public string? ExpenseCategoryName { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class ExpenseOptionCreateRequest
    {
        public Guid ExpenseCategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class ExpenseOptionUpdateRequest
    {
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class ActivityCodeDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class ActivityCodeCreateRequest
    {
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class ActivityCodeUpdateRequest
    {
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class DirectorCodeDto
    {
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class DirectorCodeCreateRequest
    {
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class DirectorCodeUpdateRequest
    {
        public string? Description { get; set; }
    }

    public class ReasonCodeDto
    {
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class ReasonCodeCreateRequest
    {
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class ReasonCodeUpdateRequest
    {
        public string? Description { get; set; }
    }

    public class UnionDto
    {
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class UnionCreateRequest
    {
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class UnionUpdateRequest
    {
        public string? Description { get; set; }
    }

    public class NetworkNumberDto
    {
        public Guid Id { get; set; }
        public int Number { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class NetworkNumberCreateRequest
    {
        public int Number { get; set; }
        public string? Description { get; set; }
    }

    public class NetworkNumberUpdateRequest
    {
        public int Number { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class AdminProjectDto
    {
        public Guid Id { get; set; }
        public string? ProjectNo { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal? EstimatedHours { get; set; }
        public bool IsActive { get; set; }
    }

    public class AdminProjectCreateRequest
    {
        public string? ProjectNo { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal? EstimatedHours { get; set; }
    }

    public class AdminProjectUpdateRequest
    {
        public string? ProjectNo { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal? EstimatedHours { get; set; }
        public bool IsActive { get; set; }
    }

    public class ProjectActivityOptionDto
    {
        public Guid ProjectId { get; set; }
        public Guid ActivityCodeId { get; set; }
        public Guid NetworkNumberId { get; set; }
    }

    public class ProjectActivityOptionCreateRequest
    {
        public Guid ProjectId { get; set; }
        public Guid ActivityCodeId { get; set; }
        public Guid NetworkNumberId { get; set; }
    }

    public class ProjectActivityOptionDetailDto
    {
        public Guid ProjectId { get; set; }
        public Guid ActivityCodeId { get; set; }
        public Guid NetworkNumberId { get; set; }
        public ActivityCodeDto? ActivityCode { get; set; }
        public NetworkNumberDto? NetworkNumber { get; set; }
    }
}
