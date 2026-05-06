namespace Witter.Api.Models
{
    public class ProjectSkill
    {
        // Las llaves primarias compuestas ya las configuramos en el WitterDbContext
        public int ProjectId { get; set; }
        public int SkillId { get; set; }
    }
}