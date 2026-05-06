namespace Witter.Api.DTOs
{
    public class ProjectDto
    {
        public string Title { get; set; }
        public string ProjectDescription { get; set; }
        public string Category { get; set; }
        public string LevelReq { get; set; }
        public decimal Budget { get; set; }
        public int Duration { get; set; }
        public string WorkMode { get; set; }
        
        // Lista de IDs de habilidades (Skills) requeridas para el proyecto
        public List<int> RequiredSkillIds { get; set; } 
    }
}