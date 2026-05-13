namespace Witter.Api.DTOs
{
    public class ProjectCreateDto
    {
        public string Title { get; set; }
        public string? ProjectDescription { get; set; }
        public string? Category { get; set; }
        public string? LevelReq { get; set; }
        public decimal Budget { get; set; }
        public int Duration { get; set; }
        public List<int>? RequiredSkillIds { get; set; }
        public List<MilestoneCreateDto>? Milestones { get; set; }
    }
}