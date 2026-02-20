using System;

namespace DSC.Data.Models
{
    public class UserPosition
    {
        public int UserEmpId { get; set; }
        public int PositionId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
