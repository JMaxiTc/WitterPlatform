using System;
using System.ComponentModel.DataAnnotations;

namespace Witter.Api.Models
{
    public class Submission
    {
        [Key]
        public int Id { get; set; }
        public int MilestoneId { get; set; }
        public Guid GraduateId { get; set; }
        public string RepoUrl { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
        public string Feedback { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public bool IsApproved { get; set; } = false;
        
        // Firma digital que garantiza el No Repudio de la entrega
        public string? DigitalSignature { get; set; }
    }
}