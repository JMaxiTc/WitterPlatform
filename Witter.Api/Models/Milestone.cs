using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Witter.Api.Models
{
    public class Milestone
    {
        [Key]
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int Step { get; set; }
        public string? Title { get; set; }
        public string? TaskDescription { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        public int StepNumber { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? PaymentStatus { get; set; } = "Pending";
        
        // Navigation properties si los usas
        // public Project Project { get; set; }
    }
}