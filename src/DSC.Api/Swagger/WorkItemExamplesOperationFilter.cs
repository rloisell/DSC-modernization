/*
 * WorkItemExamplesOperationFilter.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Swagger/OpenAPI operation filter that injects realistic example request and response bodies
 * for the work-item endpoints, improving Swagger UI usability during development.
 * AI-assisted: OpenApiObject construction, Swashbuckle IOperationFilter pattern; reviewed and directed by Ryan Loiselle.
 */

using System;
using System.Linq;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace DSC.Api.Swagger
{
    public class WorkItemExamplesOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            if (operation == null || context == null) return;

            var apiDesc = context.ApiDescription.RelativePath?.Trim('/');

            // POST /api/items - example request and response
            if (string.Equals(apiDesc, "api/items", StringComparison.OrdinalIgnoreCase) &&
                context.ApiDescription.HttpMethod?.Equals("POST", StringComparison.OrdinalIgnoreCase) == true)
            {
                var exampleReq = new OpenApiObject
                {
                    ["title"] = new OpenApiString("Site visit - inspect panel"),
                    ["projectId"] = new OpenApiString("33333333-3333-3333-3333-333333333333"),
                    ["budgetId"] = new OpenApiString("55555555-5555-5555-5555-555555555555"),
                    ["description"] = new OpenApiString("Performed inspection and noted minor corrosion."),
                    ["legacyActivityId"] = new OpenApiString("ACT-12345"),
                    ["date"] = new OpenApiString("2026-02-19"),
                    ["startTime"] = new OpenApiString("09:00"),
                    ["endTime"] = new OpenApiString("11:30"),
                    ["plannedDuration"] = new OpenApiDouble(2.5),
                    ["actualDuration"] = new OpenApiDouble(2.5),
                    ["activityCode"] = new OpenApiString("INSPECT"),
                    ["networkNumber"] = new OpenApiInteger(1001),
                    ["estimatedHours"] = new OpenApiDouble(2.5),
                    ["remainingHours"] = new OpenApiDouble(0.0)
                };

                if (operation.RequestBody?.Content?.ContainsKey("application/json") == true)
                {
                    operation.RequestBody.Content["application/json"].Example = exampleReq;
                }

                // Provide a 201 example response body { id: guid }
                var createdExample = new OpenApiObject
                {
                    ["id"] = new OpenApiString("44444444-4444-4444-4444-444444444444")
                };

                operation.Responses["201"] = new OpenApiResponse
                {
                    Description = "Created",
                    Content =
                    {
                        ["application/json"] = new OpenApiMediaType { Example = createdExample }
                    }
                };
            }

            // GET /api/items/{id} - example response
            if (apiDesc != null && apiDesc.StartsWith("api/items/", StringComparison.OrdinalIgnoreCase) &&
                context.ApiDescription.HttpMethod?.Equals("GET", StringComparison.OrdinalIgnoreCase) == true)
            {
                var exampleResp = new OpenApiObject
                {
                    ["id"] = new OpenApiString("44444444-4444-4444-4444-444444444444"),
                    ["projectId"] = new OpenApiString("33333333-3333-3333-3333-333333333333"),
                    ["budgetId"] = new OpenApiString("55555555-5555-5555-5555-555555555555"),
                    ["budgetDescription"] = new OpenApiString("CAPEX"),
                    ["legacyActivityId"] = new OpenApiString("ACT-12345"),
                    ["date"] = new OpenApiString("2026-02-19"),
                    ["startTime"] = new OpenApiString("09:00"),
                    ["endTime"] = new OpenApiString("11:30"),
                    ["plannedDuration"] = new OpenApiDouble(2.5),
                    ["actualDuration"] = new OpenApiDouble(2.5),
                    ["activityCode"] = new OpenApiString("INSPECT"),
                    ["networkNumber"] = new OpenApiInteger(1001),
                    ["title"] = new OpenApiString("Site visit - inspect panel"),
                    ["description"] = new OpenApiString("Performed inspection and noted minor corrosion."),
                    ["estimatedHours"] = new OpenApiDouble(2.5),
                    ["remainingHours"] = new OpenApiDouble(0.0)
                };

                operation.Responses["200"] = new OpenApiResponse
                {
                    Description = "OK",
                    Content =
                    {
                        ["application/json"] = new OpenApiMediaType { Example = exampleResp }
                    }
                };
            }
        }
    }
}
