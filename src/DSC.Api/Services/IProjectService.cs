using DSC.Api.DTOs;

namespace DSC.Api.Services;

public interface IProjectService
{
    Task<IEnumerable<ProjectDto>> GetAllAsync(Guid? requesterId);
}
