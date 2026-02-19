using System;

namespace DSC.Data.Models
{
    public class ExpenseOption
    {
        public Guid Id { get; set; }
        public Guid ExpenseCategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        public ExpenseCategory? Category { get; set; }
    }
}
