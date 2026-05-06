using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Witter.Api.Models
{
    public class GraduateProfile
    {
        [Key]
        public Guid UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string School { get; set; }
        public string Degree { get; set; }
        public string GithubUrl { get; set; }

        // Propiedad calculada: No se mapea a la base de datos
        [NotMapped]
        public int Age 
        {
            get 
            {
                var today = DateTime.Today;
                var age = today.Year - DateOfBirth.Year;
                if (DateOfBirth.Date > today.AddYears(-age)) age--;
                return age;
            }
        }
    }
}