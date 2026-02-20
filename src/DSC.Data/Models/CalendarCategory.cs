using System.Collections.Generic;

namespace DSC.Data.Models
{
    public class CalendarCategory
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public ICollection<CalendarEntry> Calendars { get; set; } = new List<CalendarEntry>();
    }
}
