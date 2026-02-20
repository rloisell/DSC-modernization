using System;

namespace DSC.Data.Models
{
    public class CalendarEntry
    {
        public DateTime Date { get; set; }
        public int CalendarCategoryId { get; set; }

        public CalendarCategory? CalendarCategory { get; set; }
    }
}
