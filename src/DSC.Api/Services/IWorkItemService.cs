using DSC.Api.DTOs;

namespace DSC.Api.Services;

public interface IWorkItemService
{
    Task<WorkItemDto[]> GetAllAsync(Guid? userId);

    Task<WorkItemDetailDto[]> GetDetailedAsync(
        Guid? userId,
        DateTime? startDate,
        DateTime? endDate,
        string? period);

    /// <exception cref="Infrastructure.NotFoundException"/>
    Task<WorkItemDto> GetByIdAsync(Guid id);

    /// <exception cref="Infrastructure.BadRequestException"/>
    Task<WorkItemDto> CreateAsync(WorkItemCreateRequest request);

    /// <exception cref="Infrastructure.NotFoundException"/>
    /// <exception cref="Infrastructure.ForbiddenException"/>
    Task UpdateAsync(Guid id, WorkItemUpdateRequest request, Guid? requesterId);

    /// <exception cref="Infrastructure.NotFoundException"/>
    /// <exception cref="Infrastructure.ForbiddenException"/>
    Task DeleteAsync(Guid id, Guid? requesterId);

    /// <exception cref="Infrastructure.NotFoundException"/>
    Task<RemainingHoursDto> GetProjectRemainingHoursAsync(Guid projectId, Guid requesterId);
}
