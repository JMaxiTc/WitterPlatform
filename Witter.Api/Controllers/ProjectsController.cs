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
    [Authorize] // Exigimos Token JWT, pero sin restringir el rol a nivel global
    public class ProjectsController : ControllerBase
    {
        private readonly WitterDbContext _context;

        public ProjectsController(WitterDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Company")] // Este método SÍ es exclusivo para Empresas
        public async Task<IActionResult> CreateProject([FromBody] ProjectCreateDto dto)
        {
            // ... (Conserva todo el código que ya tenías adentro de este método, no cambia nada)
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdStr, out Guid companyUserId)) return Unauthorized(new { Message = "Sesión inválida." });

            var totalMilestones = dto.Milestones?.Sum(m => m.Amount) ?? 0;
            if (totalMilestones != dto.Budget) return BadRequest(new { Message = "El presupuesto de los hitos no coincide." });

            // 2. Crear el Proyecto Principal
            var project = new Project
            {
                CompanyId = companyUserId,
                Title = dto.Title,
                Category = dto.Category,
                Budget = dto.Budget,
                Status = "Open",
                CreatedAt = DateTime.UtcNow,
                Description = dto.ProjectDescription,
                LevelRequired = dto.LevelReq,
                DurationDays = dto.Duration,
                ProjectDescription = dto.ProjectDescription,
                LevelReq = dto.LevelReq,
                Duration = dto.Duration
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync(); 

            if (dto.RequiredSkillIds != null && dto.RequiredSkillIds.Any())
            {
                var projectSkills = dto.RequiredSkillIds.Select(skillId => new ProjectSkill { ProjectId = project.Id, SkillId = skillId });
                _context.ProjectSkills.AddRange(projectSkills);
            }

            if (dto.Milestones != null && dto.Milestones.Any())
            {
                var milestones = dto.Milestones.Select(m => new Milestone { ProjectId = project.Id, StepNumber = m.Step, Title = m.Title, Description = m.TaskDescription, Amount = m.Amount, Status = "Pending" });
                _context.Milestones.AddRange(milestones);
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Proyecto publicado exitosamente.", ProjectId = project.Id });
        }

        // --- NUEVO ENDPOINT PARA EL MARKETPLACE ---
        [HttpGet("open")]
        [Authorize(Roles = "Graduate")] // Exclusivo para que los Egresados exploren
        public async Task<IActionResult> GetOpenProjects()
        {
            // Buscamos proyectos abiertos y cruzamos datos con la tabla de empresas y habilidades
            var projects = await _context.Projects
                .Where(p => p.Status == "Open")
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Description,
                    p.Category,
                    p.Budget,
                    p.DurationDays,
                    p.LevelRequired,
                    CreatedAt = p.CreatedAt,
                    // Obtenemos el nombre de la empresa dueña
                    CompanyName = _context.CompanyProfiles.FirstOrDefault(c => c.UserId == p.CompanyId).CompanyName,
                    // Obtenemos los nombres de las habilidades requeridas (usando IDs de catálogo 1=C#, 2=React, etc.)
                    Skills = _context.ProjectSkills
                                .Where(ps => ps.ProjectId == p.Id)
                                .Join(_context.Skills, ps => ps.SkillId, s => s.Id, (ps, s) => s.Name)
                                .ToList()
                })
                .OrderByDescending(p => p.CreatedAt) // Los más recientes primero
                .ToListAsync();

            return Ok(projects);
        }
        // --- NUEVO: OBTENER DETALLES DE UN PROYECTO (INCLUYE HITOS) ---
        [HttpGet("{id}")]
        [Authorize] // Egresados y Empresas pueden verlo
        public async Task<IActionResult> GetProjectDetails(int id)
        {
            var project = await _context.Projects
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Description,
                    p.Category,
                    p.Budget,
                    p.DurationDays,
                    p.LevelRequired,
                    p.CreatedAt,
                    // Nombre de la empresa
                    CompanyName = _context.CompanyProfiles.FirstOrDefault(c => c.UserId == p.CompanyId).CompanyName,
                    
                    // --- AQUÍ ESTÁ LA LÍNEA CORREGIDA ---
                    Skills = _context.ProjectSkills
                                .Where(ps => ps.ProjectId == p.Id)
                                .Join(_context.Skills, ps => ps.SkillId, s => s.Id, (ps, s) => s.Name)
                                .ToList(),
                                
                    // LOS HITOS DEL ESCROW (Ordenados por paso)
                    Milestones = _context.Milestones
                                .Where(m => m.ProjectId == p.Id)
                                .OrderBy(m => m.StepNumber)
                                .Select(m => new { 
                                    m.Id, 
                                    m.StepNumber, 
                                    m.Title, 
                                    m.Description, 
                                    m.Amount 
                                })
                                .ToList()
                })
                .FirstOrDefaultAsync();

            if (project == null) return NotFound(new { Message = "Proyecto no encontrado." });

            return Ok(project);
        }
    }
}