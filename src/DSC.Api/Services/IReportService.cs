using DSC.Api.DTOs;

namespace DSC.Api.Services;

public interface IReportService
{
    Task<ReportSummaryDto> GetSummaryAsync(
        DateTime? from,
        DateTime? to,
        Guid? projectId,
        Guid? userId,
        Guid? requesterId);
}
