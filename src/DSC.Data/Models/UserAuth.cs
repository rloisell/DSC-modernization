namespace DSC.Data.Models
{
    public class UserAuth
    {
        public string UserName { get; set; } = null!; // primary key in legacy
        public string Password { get; set; } = null!; // legacy password storage

        public int? EmpId { get; set; }
        // Navigation
        public User? User { get; set; }
    }
}
