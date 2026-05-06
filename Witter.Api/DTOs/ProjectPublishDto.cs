using System;
using System.Collections.Generic;

namespace Witter.Api.DTOs
{
    public class ProjectPublishDto
    {
        public string Title { get; set; }
        public string ProjectDescription { get; set; }
        public string Category { get; set; }
        public string LevelReq { get; set; }
        public decimal Budget { get; set; }
        public DateTime? StartDate { get; set; }
        public int? Duration { get; set; }
        public string WorkMode { get; set; }
        
        // Habilidades requeridas
        public List<int> RequiredSkillIds { get; set; } 
        
        // Lista de Hitos (Milestones)
        public List<MilestoneCreateDto> Milestones { get; set; }
    }

    public class MilestoneCreateDto
    {
        public int Step { get; set; }
        public string Title { get; set; }
        public string TaskDescription { get; set; }
        public decimal Amount { get; set; }
    }
}