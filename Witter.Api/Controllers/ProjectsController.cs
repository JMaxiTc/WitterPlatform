using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Witter.Api.Data;
using Witter.Api.DTOs;
using Witter.Api.Models;
using Witter.Api.Services;


namespace Witter.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Exigimos Token JWT, pero sin restringir el rol a nivel global
    public class ProjectsController : ControllerBase
    {
        private readonly WitterDbContext _context;
        private readonly DigitalSignatureService _digitalSignatureService;

        public ProjectsController(WitterDbContext context, DigitalSignatureService digitalSignatureService)
        {
            _context = context;
            _digitalSignatureService = digitalSignatureService;
        }

        [HttpPost]
        [IgnoreAntiforgeryToken]
        [Authorize(Roles = "Company")] // Método solo para empresa
        public async Task<IActionResult> CreateProject([FromBody] ProjectCreateDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdStr, out Guid companyUserId)) return Unauthorized(new { Message = "Sesión inválida." });

            var totalMilestones = dto.Milestones?.Sum(m => m.Amount) ?? 0;
            if (totalMilestones != dto.Budget) return BadRequest(new { Message = "El presupuesto de los hitos no coincide." });

            // Crear el Proyecto Principal
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

        // Método para ver los proyectos abiertos
        [HttpGet("open")]
        [Authorize(Roles = "Graduate")] // Vista solo para egresados
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
        // Método para postularse a un proyecto (egresado)
        [HttpPost("{id}/apply")]
        [Authorize(Roles = "Graduate")] // Metodo para egresado
        public async Task<IActionResult> ApplyToProject(int id)
        {
            // Obtener el UserId del token JWT
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdStr, out Guid userId)) 
                return Unauthorized(new { Message = "Sesión inválida." });

            // Verificar que el proyecto exista y esté abierto
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id);
            if (project == null) 
                return NotFound(new { Message = "Proyecto no encontrado." });
                
            if (project.Status != "Open") 
                return BadRequest(new { Message = "El proyecto ya no acepta postulaciones." });

            // Buscar el Perfil del Egresado (GraduateProfile)
            var graduateProfile = await _context.GraduateProfiles.FirstOrDefaultAsync(gp => gp.UserId == userId);
            if (graduateProfile == null)
                return NotFound(new { Message = "Perfil de egresado no encontrado." });

            // Evitar postulaciones duplicadas
            bool alreadyApplied = await _context.Applications
                .AnyAsync(a => a.ProjectId == id && a.GraduateId == graduateProfile.UserId);

            if (alreadyApplied)
                return BadRequest(new { Message = "Ya estás postulado a este proyecto." });

            // Crear la Postulación (Application)
            var application = new Application
            {
                ProjectId = id,
                GraduateId = graduateProfile.UserId,
                AppliedAt = DateTime.UtcNow,
                ApplicationStatus = "Pending" // Default al postularse
            };

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Postulación enviada correctamente." });
        }
        // Método para obtener detalle de un proyecto
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
                                    m.Amount,
                                    m.Status,
                                    LatestSubmission = _context.Submissions
                                        .Where(s => s.MilestoneId == m.Id)
                                        .OrderByDescending(s => s.SubmittedAt)
                                        .Select(s => new { s.RepoUrl, s.Comment, s.Feedback })
                                        .FirstOrDefault()
                                })
                                .ToList()
                })
                .FirstOrDefaultAsync();

            if (project == null) return NotFound(new { Message = "Proyecto no encontrado." });

            return Ok(project);
        }

        // Método para obtener las postulaciones de un egresado
        [HttpGet("my-applications")]
        [Authorize(Roles = "Graduate")]
        public async Task<IActionResult> GetMyApplications()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdStr, out Guid graduateId)) return Unauthorized(new { Message = "Sesión inválida." });

            var applications = await _context.Applications
                .Where(a => a.GraduateId == graduateId)
                .Join(_context.Projects, a => a.ProjectId, p => p.Id, (a, p) => new
                {
                    a.Id,
                    a.ProjectId,
                    a.AppliedAt,
                    a.ApplicationStatus,
                    ProjectTitle = p.Title,
                    ProjectBudget = p.Budget,
                    ProjectStatus = p.Status,
                    CompanyName = _context.CompanyProfiles.FirstOrDefault(c => c.UserId == p.CompanyId).CompanyName
                })
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();

            return Ok(applications);
        }

        // Método para obtener las postulaciones a un proyecto (empresa)
        [HttpGet("{id}/applications")]
        [Authorize(Roles = "Company")] // Empresa ve quién se postuló a su proyecto
        public async Task<IActionResult> GetProjectApplications(int id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdStr, out Guid companyUserId)) return Unauthorized(new { Message = "Sesión inválida." });

            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == companyUserId);
            if (project == null) return NotFound(new { Message = "Proyecto no encontrado o no autorizado." });

            var applications = await _context.Applications
                .Where(a => a.ProjectId == id)
                .Join(_context.GraduateProfiles, a => a.GraduateId, gp => gp.UserId, (a, gp) => new
                {
                    a.Id,
                    a.ProjectId,
                    a.GraduateId,
                    a.AppliedAt,
                    a.ApplicationStatus,
                    GraduateName = gp.FirstName + " " + gp.LastName,
                    GraduateDegree = gp.Degree // "ProfessionalTitle" didn't exist, using Degree instead
                })
                .ToListAsync();

            return Ok(applications);
        }

        // // Método para aceptar o rechazar una postulación (empresa)
        [HttpPut("{id}/applications/{applicationId}/status")]
        [Authorize(Roles = "Company")]
        public async Task<IActionResult> UpdateApplicationStatus(int id, int applicationId, [FromBody] UpdateApplicationStatusDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdStr, out Guid companyUserId)) return Unauthorized(new { Message = "Sesión inválida." });

            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == companyUserId);
            if (project == null) return NotFound(new { Message = "Proyecto no encontrado o no autorizado." });

            var application = await _context.Applications.FirstOrDefaultAsync(a => a.Id == applicationId && a.ProjectId == id);
            if (application == null) return NotFound(new { Message = "Postulación no encontrada." });

            if (dto.Status != "Accepted" && dto.Status != "Rejected")
            {
                return BadRequest(new { Message = "Estado inválido. Use 'Accepted' o 'Rejected'." });
            }

            application.ApplicationStatus = dto.Status;
            
            if (dto.Status == "Accepted") 
            {
                project.Status = "En curso";
            }
            
            // Opcional: si se acepta una, podríamos rechazar a los demás o cambiar el estado del proyecto. Lo mantendremos simple por ahora.
            
            await _context.SaveChangesAsync();

            return Ok(new { Message = $"Postulación {(dto.Status == "Accepted" ? "aceptada" : "rechazada")} exitosamente." });
        }

        // Método para enviar entrega de un hito (egresado)
        [HttpPost("{id}/milestones/{milestoneId}/submit")]
        [Authorize(Roles = "Graduate")]
        public async Task<IActionResult> SubmitMilestone(int id, int milestoneId, [FromBody] SubmissionSubmitDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdStr, out Guid graduateId)) return Unauthorized();

            var project = await _context.Projects.FindAsync(id);
            if (project == null) return NotFound(new { Message = "Proyecto no encontrado." });

            var milestone = await _context.Milestones.FirstOrDefaultAsync(m => m.Id == milestoneId && m.ProjectId == id);
            if (milestone == null) return NotFound(new { Message = "Hito no encontrado." });

            // Verificar postulación aceptada
            var app = await _context.Applications.FirstOrDefaultAsync(a => a.ProjectId == id && a.GraduateId == graduateId && a.ApplicationStatus == "Accepted");
            if (app == null) return BadRequest(new { Message = "No estás asignado a este proyecto." });

            string contentToSign = $"{milestoneId}_{graduateId}_{dto.RepoUrl}_{dto.Comment}_{DateTime.UtcNow.ToString("yyyyMMddHHmmss")}";
            string generatedSignature = _digitalSignatureService.SignData(contentToSign);

            var submission = new Submission
            {
                MilestoneId = milestoneId,
                GraduateId = graduateId,
                RepoUrl = dto.RepoUrl ?? "",
                Comment = dto.Comment ?? "",
                Feedback = "",
                SubmittedAt = DateTime.UtcNow,
                IsApproved = false,
                DigitalSignature = generatedSignature 
            };

            milestone.Status = "En revisión";

            _context.Submissions.Add(submission);
            await _context.SaveChangesAsync();

            return Ok(new { 
                Message = "Entrega enviada exitosamente para revisión.",
                DigitalSignature = generatedSignature,
                VerificationKey = _digitalSignatureService.GetPublicKey() 
            });
        }

        // Método para revisar entrega (empresa)
        [HttpPost("{id}/milestones/{milestoneId}/review")]
        [Authorize(Roles = "Company")]
        public async Task<IActionResult> ReviewMilestone(int id, int milestoneId, [FromBody] SubmissionReviewDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdStr, out Guid companyUserId)) return Unauthorized();

            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == companyUserId);
            if (project == null) return NotFound(new { Message = "Proyecto no encontrado o no autorizado." });

            var milestone = await _context.Milestones.FirstOrDefaultAsync(m => m.Id == milestoneId && m.ProjectId == id);
            if (milestone == null) return NotFound(new { Message = "Hito no encontrado." });

            var submission = await _context.Submissions.Where(s => s.MilestoneId == milestoneId).OrderByDescending(s => s.SubmittedAt).FirstOrDefaultAsync();
            if (submission == null) return NotFound(new { Message = "No hay entregas para este hito." });

            submission.IsApproved = dto.IsApproved;
            submission.Feedback = dto.Feedback ?? "";

            if (dto.IsApproved)
            {
                milestone.Status = "Liberado";
                await _context.SaveChangesAsync();
                
                // Buscar si todos los hitos de este proyecto ya están liberados
                var allMilestones = await _context.Milestones.Where(m => m.ProjectId == id).ToListAsync();
                if (allMilestones.All(m => m.Status == "Liberado")) 
                {
                    project.Status = "Completed";
                }
            } else
            {
             milestone.Status = "Rechazado";   
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = dto.IsApproved ? "Hito aprobado y pago liberado." : "Hito rechazado." });
        }

        // Obtener entregas de un hito
        [HttpGet("{id}/milestones/{milestoneId}/submissions")]
        [Authorize]
        public async Task<IActionResult> GetMilestoneSubmissions(int id, int milestoneId)
        {
            var submissions = await _context.Submissions
                .Where(s => s.MilestoneId == milestoneId)
                .OrderByDescending(s => s.SubmittedAt)
                .Select(s => new {
                    s.Id,
                    s.RepoUrl,
                    s.Comment,
                    s.Feedback,
                    s.SubmittedAt,
                    s.IsApproved
                })
                .ToListAsync();

            return Ok(submissions);
        }
    }
}