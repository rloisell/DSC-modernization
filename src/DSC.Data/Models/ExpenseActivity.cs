namespace DSC.Data.Models
{
    public class ExpenseActivity
    {
        public int ActivityId { get; set; }
        public string DirectorCode { get; set; } = string.Empty;
        public string ReasonCode { get; set; } = string.Empty;
        public string CpcCode { get; set; } = string.Empty;
    }
}
