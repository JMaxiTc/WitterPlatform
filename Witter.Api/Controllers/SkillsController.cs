using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Witter.Api.Data;
using System.Threading.Tasks;

namespace Witter.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SkillsController : ControllerBase
    {
        private readonly WitterDbContext _context;

        public SkillsController(WitterDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSkills()
        {
            // Devuelve todas las habilidades desde SQL Server
            var skills = await _context.Skills
                .OrderBy(s => s.Name)
                .Select(s => new { s.Id, s.Name })
                .ToListAsync();

            return Ok(skills);
        }
    }
}
