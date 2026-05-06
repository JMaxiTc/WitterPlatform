using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Witter.Api.Models
{
    public class Project
    {
        [Key]
        public int Id { get; set; }
        public Guid CompanyId { get; set; }
        public string Title { get; set; }
        public string ProjectDescription { get; set; }
        public string Category { get; set; }
        public string LevelReq { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Budget { get; set; }
        public DateTime? StartDate { get; set; }
        public int? Duration { get; set; }
        public string WorkMode { get; set; }
        public string ProjectStatus { get; set; } = "Open";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Description { get; set; }
        public string LevelRequired { get; set; }
        public int DurationDays { get; set; }
        public string Status { get; set; }
    }
}