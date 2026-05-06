using System;
using System.Collections.Generic;

namespace Witter.Api.DTOs
{
    public class GraduateRegisterDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string School { get; set; }
        public string Degree { get; set; }
        public string GithubUrl { get; set; }
        
        // Lista de IDs de los lenguajes/habilidades que domina
        public List<int> SkillIds { get; set; } 
    }
}