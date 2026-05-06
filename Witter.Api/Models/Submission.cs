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
        public string RepoUrl { get; set; }
        public string Comment { get; set; }
        public string Feedback { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public bool IsApproved { get; set; } = false;
    }
}