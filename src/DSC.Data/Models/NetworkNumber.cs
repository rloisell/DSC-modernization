using System;

namespace DSC.Data.Models
{
    public class NetworkNumber
    {
        public Guid Id { get; set; }
        public int Number { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
