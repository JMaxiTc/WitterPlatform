using System.ComponentModel.DataAnnotations;

namespace Witter.Api.Models
{
    public class Skill
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
    }
}