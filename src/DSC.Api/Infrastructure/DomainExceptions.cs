namespace DSC.Api.Infrastructure;

/// <summary>
/// Thrown when a requested resource does not exist. Maps to HTTP 404.
/// </summary>
public class NotFoundException(string message) : Exception(message) { }

/// <summary>
/// Thrown when the caller is not allowed to perform the requested action. Maps to HTTP 403.
/// </summary>
public class ForbiddenException(string message) : Exception(message) { }

/// <summary>
/// Thrown when request data fails business-rule validation. Maps to HTTP 400.
/// </summary>
public class BadRequestException(string message) : Exception(message) { }

/// <summary>
/// Thrown when credentials are invalid or the account is inactive. Maps to HTTP 401.
/// </summary>
public class UnauthorizedException(string message) : Exception(message) { }
