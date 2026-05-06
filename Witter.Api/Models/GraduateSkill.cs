using System;

namespace Witter.Api.Models
{
    public class GraduateSkill
    {
        // Las llaves primarias compuestas ya las configuramos en el WitterDbContext
        public Guid GraduateId { get; set; }
        public int SkillId { get; set; }
    }
}