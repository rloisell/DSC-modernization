using System;
using System.Collections.Generic;

namespace DSC.Data.Models
{
    public class ExpenseCategory
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        public ICollection<ExpenseOption> Options { get; set; } = new List<ExpenseOption>();
    }
}
