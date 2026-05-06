using System;
using System.ComponentModel.DataAnnotations;

namespace Witter.Api.Models
{
    public class Application
    {
        [Key]
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public Guid GraduateId { get; set; }
        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
        public string ApplicationStatus { get; set; } = "Pending";
    }
}