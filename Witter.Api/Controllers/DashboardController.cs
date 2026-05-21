using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Witter.Api.Data;

using Witter.Api.Models;

namespace Witter.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly WitterDbContext _context;

        public DashboardController(WitterDbContext context)
        {
            _context = context;
        }

        [HttpGet("company")]
        [Authorize(Roles = "Company")]
        public async Task<IActionResult> GetCompanyDashboard()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdStr, out Guid companyUserId)) 
                return Unauthorized(new { Message = "Sesión inválida." });

            var projects = await _context.Projects
                .Where(p => p.CompanyId == companyUserId)
                .ToListAsync();

            var projectIds = projects.Select(p => p.Id).ToList();

            var milestones = await _context.Milestones
                .Where(m => projectIds.Contains(m.ProjectId))
                .ToListAsync();

            var applications = await _context.Applications
                .Where(a => projectIds.Contains(a.ProjectId) && a.ApplicationStatus == "Accepted")
                .ToListAsync();

            var graduateIds = applications.Select(a => a.GraduateId).Distinct().ToList();
            
            var graduates = await _context.GraduateProfiles
                .Where(g => graduateIds.Contains(g.UserId))
                .ToListAsync();

            var activeProjects = projects.Where(p => p.Status != "Closed").ToList();

            // Total budget in escrow for active projects
            var escrowTotal = activeProjects.Sum(p => p.Budget);
            
            // Pending milestones 
            var pendingMilestonesEntity = milestones
                .Where(m => m.Status == "En revisión")
                .ToList();

            var pendingMilestones = pendingMilestonesEntity.Select(m => {
                var project = projects.FirstOrDefault(p => p.Id == m.ProjectId);
                var application = applications.FirstOrDefault(a => a.ProjectId == m.ProjectId);
                var graduate = application != null ? graduates.FirstOrDefault(g => g.UserId == application.GraduateId) : null;
                var graduateName = graduate != null ? $"{graduate.FirstName} {graduate.LastName}" : "Sin Egresado Asignado";

                return new {
                    id = m.Id,
                    projectId = m.ProjectId,
                    title = m.Title,
                    projectName = project?.Title ?? "Desconocido",
                    graduateName = graduateName,
                    amount = m.Amount,
                    // If you have RepoUrl in Milestone or Submission, use it. Mocking for now:
                    repoUrl = "github.com/..."
                };
            }).ToList();

            var activeProjectsDto = activeProjects.Select(p => {
                var projectMilestones = milestones.Where(m => m.ProjectId == p.Id).ToList();
                var application = applications.FirstOrDefault(a => a.ProjectId == p.Id);
                var graduate = application != null ? graduates.FirstOrDefault(g => g.UserId == application.GraduateId) : null;
                var graduateName = graduate != null ? $"{graduate.FirstName} {graduate.LastName}" : "Buscando Talento...";

                var approvedCount = projectMilestones.Count(m => m.Status == "Liberado");

                return new {
                    id = p.Id,
                    name = p.Title,
                    graduateName = graduateName,
                    startDate = p.CreatedAt.ToString("dd/MM/yyyy"),
                    currentMilestone = Math.Min(approvedCount + 1, projectMilestones.Count > 0 ? projectMilestones.Count : 1),
                    totalMilestones = projectMilestones.Count > 0 ? projectMilestones.Count : 1,
                    progressPct = projectMilestones.Count > 0 ? (approvedCount * 100) / projectMilestones.Count : 0,
                    budget = p.Budget,
                    colorClass = "var(--blue-500)",
                    status = p.Status == "Completed" ? "Finalizado" : (p.Status == "En curso" ? "En curso" : "Activo")
                };
            }).ToList();

            return Ok(new {
                escrowTotal = escrowTotal,
                stats = new {
                    activeProjects = activeProjects.Count,
                    paymentsReleased = projectMilestonesGlobalApprovedSum(milestones),
                    pendingMilestones = pendingMilestones.Count
                },
                pendingMilestones = pendingMilestones,
                activeProjects = activeProjectsDto
            });
        }
        
        private decimal projectMilestonesGlobalApprovedSum(List<Milestone> milestones) {
            return milestones.Where(m => m.Status == "Liberado").Sum(m => m.Amount);
        }

        [HttpGet("graduate")]
        [Authorize(Roles = "Graduate")]
        public async Task<IActionResult> GetGraduateDashboard()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdStr, out Guid graduateUserId)) 
                return Unauthorized(new { Message = "Sesión inválida." });

            // Proyectos a los que fue aceptado
            var applications = await _context.Applications
                .Where(a => a.GraduateId == graduateUserId && a.ApplicationStatus == "Accepted")
                .ToListAsync();

            var projectIds = applications.Select(a => a.ProjectId).ToList();

            var projects = await _context.Projects
                .Where(p => projectIds.Contains(p.Id))
                .ToListAsync();

            var companyIds = projects.Select(p => p.CompanyId).Distinct().ToList();
            var companies = await _context.CompanyProfiles
                .Where(c => companyIds.Contains(c.UserId))
                .ToListAsync();

            var milestones = await _context.Milestones
                .Where(m => projectIds.Contains(m.ProjectId))
                .ToListAsync();

            var activeProjects = projects.Where(p => p.Status != "Closed").ToList();

            var completedMilestones = milestones.Where(m => m.Status == "Liberado").ToList();
            var totalEarnings = completedMilestones.Sum(m => m.Amount);
            
            var paymentHistory = completedMilestones.Select(m => new {
                id = m.Id,
                amount = m.Amount,
                title = m.Title
            }).ToList();

            var assignedProjectsDto = projects.Select(p => {
                var projectMilestones = milestones.Where(m => m.ProjectId == p.Id).OrderBy(m => m.StepNumber).ToList();
                var currentMilestoneEntity = projectMilestones.FirstOrDefault(m => m.Status != "Paid" && m.Status != "Approved");
                var company = companies.FirstOrDefault(c => c.UserId == p.CompanyId);
                
                return new {
                    id = p.Id,
                    projectName = p.Title ?? "Sin Título",
                    companyName = company?.CompanyName ?? "Desconocido",
                    currentMilestone = currentMilestoneEntity?.Title ?? "Completado",
                    amount = currentMilestoneEntity?.Amount ?? 0,
                    status = currentMilestoneEntity?.Status == "PendingReview" ? "En revisión" : "En Escrow"
                };
            }).ToList();

            // Mock de credenciales
            var credentials = new[] {
                new { 
                    id = "1", issuer = "Tecnológico de Colima", title = "Ingeniería Informática", 
                    recipient = "", date = "Dic 2025", hash = "vc:witter:0x4a7f…b3c1",
                    gradient = "linear-gradient(140deg, var(--blue-950) 0%, var(--blue-800) 100%)",
                    sealColor = "var(--blue-300)", badgeColor = "var(--green-400)"
                }
            };

            return Ok(new {
                stats = new {
                    activeProjects = activeProjects.Count,
                    totalEarnings = totalEarnings,
                    credentialsCount = 0 // Quitamos también los contadores de mock de credencial
                },
                assignedProjects = assignedProjectsDto,
                paymentHistory = paymentHistory,
                credentials = new object[] {} // Eliminamos las credenciales falsas
            });
        }
    }
}