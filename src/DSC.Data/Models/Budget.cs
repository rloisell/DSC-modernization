using System;
using System.Collections.Generic;

namespace DSC.Data.Models
{
    public class Budget
    {
        public Guid Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        public ICollection<ExpenseCategory> ExpenseCategories { get; set; } = new List<ExpenseCategory>();
        public ICollection<WorkItem> WorkItems { get; set; } = new List<WorkItem>();
    }
}
