using System.Collections.Generic;

namespace Witter.Api.DTOs
{
    public class UpdateSkillsDto
    {
        public List<int> SkillIds { get; set; } = new List<int>();
    }
}
