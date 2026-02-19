using System;

namespace DSC.Data.Models
{
    public class ExternalIdentity
    {
        public Guid Id { get; set; }
        public string Provider { get; set; } = null!; // e.g., keycloak
        public string Subject { get; set; } = null!; // provider subject (sub)

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
