using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Witter.Api.Data;

namespace Witter.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // SOLO EL SUPERUSUARIO PUEDE ACCEDER
    public class AdminController : ControllerBase
    {
        private readonly WitterDbContext _context;

        public AdminController(WitterDbContext context)
        {
            _context = context;
        }

        // Obtener empresas pendientes de aprobación
        [HttpGet("pending-companies")]
        public async Task<IActionResult> GetPendingCompanies()
        {
            var pending = await _context.Users
                .Where(u => u.UserRole == "Company" && u.IsApproved == false)
                .Join(_context.CompanyProfiles, 
                      u => u.Id, 
                      p => p.UserId, 
                      (u, p) => new { 
                          UserId = u.Id, 
                          Email = u.Email, 
                          CompanyName = p.CompanyName, 
                          RFC = p.RFC, 
                          CreatedAt = u.CreatedAt 
                      })
                .ToListAsync();

            return Ok(pending);
        }

        // Aprobar una empresa
        [HttpPut("approve-company/{userId}")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> ApproveCompany(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.UserRole != "Company") return NotFound("Empresa no encontrada.");

            user.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Empresa aprobada. Ya puede iniciar sesión." });
        }
    }
}