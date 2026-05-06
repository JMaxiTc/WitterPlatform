using System;
using System.ComponentModel.DataAnnotations;

namespace Witter.Api.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string UserRole { get; set; }
        public bool IsKycVerified { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsApproved { get; set; } = true;
    }
}