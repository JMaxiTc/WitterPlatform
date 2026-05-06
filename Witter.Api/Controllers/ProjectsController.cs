using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Witter.Api.Data;
using Witter.Api.DTOs;
using Witter.Api.Models;

namespace Witter.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Company")] // SOLO LAS EMPRESAS PUEDEN ENTRAR AQUÍ
    public class ProjectsController : ControllerBase
    {
        private readonly WitterDbContext _context;

        public ProjectsController(WitterDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] ProjectCreateDto dto)
        {
            // 1. Identificar a la empresa que está publicando
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdStr, out Guid companyUserId))
            {
                return Unauthorized(new { Message = "Sesión inválida." });
            }

            // Validar que la suma de los hitos coincida con el presupuesto total
            var totalMilestones = dto.Milestones?.Sum(m => m.Amount) ?? 0;
            if (totalMilestones != dto.Budget)
            {
                return BadRequest(new { Message = "El presupuesto de los hitos no coincide con el total del proyecto." });
            }

            // 2. Crear el Proyecto Principal
            var project = new Project
            {
                CompanyId = companyUserId, // Enlazamos el proyecto al ID de la empresa
                Title = dto.Title,
                Description = dto.ProjectDescription,
                Category = dto.Category,
                LevelRequired = dto.LevelReq,
                Budget = dto.Budget,
                DurationDays = dto.Duration,
                Status = "Open", // Estado inicial: Abierto para postulaciones
                CreatedAt = DateTime.UtcNow
            };

            _context.Projects.Add(project);
            
            // Guardamos para generar el ID del proyecto
            await _context.SaveChangesAsync(); 

            // 3. Mapear las Tecnologías (Skills) requeridas
            if (dto.RequiredSkillIds != null && dto.RequiredSkillIds.Any())
            {
                var projectSkills = dto.RequiredSkillIds.Select(skillId => new ProjectSkill
                {
                    ProjectId = project.Id,
                    SkillId = skillId
                });
                _context.ProjectSkills.AddRange(projectSkills);
            }

            // 4. Mapear los Hitos Financieros (Milestones para el Escrow)
            if (dto.Milestones != null && dto.Milestones.Any())
            {
                var milestones = dto.Milestones.Select(m => new Milestone
                {
                    ProjectId = project.Id,
                    StepNumber = m.Step,
                    Title = m.Title,
                    Description = m.TaskDescription,
                    Amount = m.Amount,
                    Status = "Pending" // Hito pendiente de entrega
                });
                _context.Milestones.AddRange(milestones);
            }

            // Guardamos las habilidades y los hitos en SQL Server
            await _context.SaveChangesAsync();

            return Ok(new { 
                Message = "Proyecto publicado y fondos en Escrow retenidos exitosamente.", 
                ProjectId = project.Id 
            });
        }
    }
}