using System;

namespace DSC.Data.Models
{
    public class DepartmentUser
    {
        public int UserEmpId { get; set; }
        public int DepartmentId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
