using System;

namespace DSC.Data.Models
{
    public class ProjectActivityOption
    {
        public Guid ProjectId { get; set; }
        public Guid ActivityCodeId { get; set; }
        public Guid NetworkNumberId { get; set; }

        public Project? Project { get; set; }
        public ActivityCode? ActivityCode { get; set; }
        public NetworkNumber? NetworkNumber { get; set; }
    }
}
