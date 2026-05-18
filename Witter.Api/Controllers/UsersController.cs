using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Witter.Api.Data;
using Witter.Api.DTOs;
using Witter.Api.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Witter.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly WitterDbContext _context;

        public UsersController(WitterDbContext context)
        {
            _context = context;
        }

        [HttpPost("register/graduate")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> RegisterGraduate([FromBody] GraduateRegisterDto dto)
        {
            // Validar si el correo ya existe
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { Message = "El correo ya está registrado." });
            }

            // Crear el Usuario
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                // Hashear la contraseña usando BCrypt
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                UserRole = "Graduate", // Rol estricto para egresados
                IsKycVerified = false, // Entra como no verificado por defecto
                CreatedAt = DateTime.UtcNow
            };

            // Crear el Perfil del Egresado
            var graduateProfile = new GraduateProfile
            {
                UserId = user.Id,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                DateOfBirth = dto.DateOfBirth,
                School = dto.School,
                Degree = dto.Degree,
                GithubUrl = dto.GithubUrl
            };

            // Mapear las habilidades de forma segura a prueba de nulos
            var graduateSkills = (dto.SkillIds ?? new List<int>()).Select(skillId => new GraduateSkill
            {
                GraduateId = user.Id,
                SkillId = skillId
            }).ToList();

            // Guardar primero el Usuario y el Perfil
            _context.Users.Add(user);
            _context.GraduateProfiles.Add(graduateProfile);
            
            // Forzamos a que SQL Server escriba estos datos AHORA MISMO
            await _context.SaveChangesAsync(); 

            // Ahora que el Perfil ya existe físicamente en SQL Server, 
            // podemos enlazarle las habilidades
            if (graduateSkills.Any())
            {
                _context.GraduateSkills.AddRange(graduateSkills);
                await _context.SaveChangesAsync();
            }

            // Validamos la edad calculada sin guardarla en BD
            return Ok(new { 
                Message = "Egresado registrado con éxito.", 
                UserId = user.Id,
                CalculatedAge = graduateProfile.Age 
            });
        }

        [HttpPost("register/company")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> RegisterCompany([FromBody] CompanyRegisterDto dto)
        {
            // Validar si el correo ya existe
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { Message = "El correo ya está registrado." });
            }

            // Crear el Usuario Base
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                UserRole = "Company",
                IsKycVerified = false,
                IsApproved = false, // Empresa entra como no aprobada por defecto (necesita ser aprobada)
                CreatedAt = DateTime.UtcNow
            };

            // Crear el Perfil de la Empresa
            var companyProfile = new CompanyProfile
            {
                UserId = user.Id,
                CompanyName = dto.CompanyName,
                RFC = dto.RFC,
                Website = dto.Website,
                Sector = dto.Sector
            };

            // Guardar en la base de datos
            _context.Users.Add(user);
            _context.CompanyProfiles.Add(companyProfile);
            
            await _context.SaveChangesAsync();

            return Ok(new { 
                Message = "Empresa registrada con éxito. Pendiente de validación KYC.", 
                UserId = user.Id 
            });
        }

        [Authorize] // Solo con JWT válido se puede entrar
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            // Extraer el ID del usuario directamente desde el Token JWT
            // Buscamos la claim estándar o la claim personalizada "id"
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                              ?? User.FindFirst("id")?.Value; 

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { Message = "Token inválido o falta el ID del usuario." });
            }

            // Buscar al usuario en la tabla principal
            var user = await _context.Users.FindAsync(userId);
            if (user == null) 
                return NotFound(new { Message = "Usuario no encontrado en la base de datos." });

            // Devolver los datos según el rol
            if (user.UserRole == "Graduate")
            {
                var profile = await _context.GraduateProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
                
                // Buscamos sus habilidades
                var skillIds = await _context.GraduateSkills
                    .Where(gs => gs.GraduateId == userId)
                    .Select(gs => gs.SkillId)
                    .ToListAsync();

                return Ok(new {
                    Id = user.Id,
                    Role = user.UserRole,
                    Email = user.Email,
                    IsKycVerified = user.IsKycVerified,
                    Profile = profile,
                    SkillIds = skillIds
                });
            }
            else if (user.UserRole == "Company")
            {
                var profile = await _context.CompanyProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

                return Ok(new {
                    Id = user.Id,
                    Role = user.UserRole,
                    Email = user.Email,
                    IsKycVerified = user.IsKycVerified,
                    Profile = profile
                });
            }

            return BadRequest(new { Message = "Rol de usuario desconocido." });
        }

        [Authorize]
        [HttpPut("me")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateGraduateProfileDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                              ?? User.FindFirst("id")?.Value; 

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { Message = "Token inválido o falta el ID del usuario." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) 
                return NotFound(new { Message = "Usuario no encontrado." });

            if (user.UserRole == "Graduate")
            {
                var profile = await _context.GraduateProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
                if (profile == null) return NotFound(new { Message = "Perfil de egresado no encontrado." });

                // Actualizar los campos permitidos
                if (dto.School != null) profile.School = dto.School;
                if (dto.Campus != null) profile.Campus = dto.Campus;
                if (dto.Degree != null) profile.Degree = dto.Degree;
                if (dto.EgressYear != null) profile.EgressYear = dto.EgressYear;
                if (dto.LicenseId != null) profile.LicenseId = dto.LicenseId;
                if (dto.Bio != null) profile.Bio = dto.Bio;
                if (dto.AvatarUrl != null) profile.AvatarUrl = dto.AvatarUrl;
                if (dto.PortfolioUrl != null) profile.PortfolioUrl = dto.PortfolioUrl;
                if (dto.GithubUrl != null) profile.GithubUrl = dto.GithubUrl;
                if (dto.LinkedinUrl != null) profile.LinkedinUrl = dto.LinkedinUrl;
                if (dto.StripeAccId != null) profile.StripeAccId = dto.StripeAccId;

                await _context.SaveChangesAsync();
                return Ok(new { Message = "Perfil actualizado correctamente." });
            }

            return BadRequest(new { Message = "La actualización de perfil no está configurada para este rol." });
        }

        [Authorize]
        [HttpPut("me/skills")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateMySkills([FromBody] UpdateSkillsDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                              ?? User.FindFirst("id")?.Value; 

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { Message = "Token inválido o falta el ID del usuario." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.UserRole != "Graduate") 
                return BadRequest(new { Message = "Solo los egresados pueden actualizar sus habilidades." });

            // 1. Eliminar habilidades actuales
            var existingSkills = await _context.GraduateSkills.Where(gs => gs.GraduateId == userId).ToListAsync();
            _context.GraduateSkills.RemoveRange(existingSkills);

            // 2. Agregar las nuevas habilidades
            if (dto.SkillIds != null && dto.SkillIds.Any())
            {
                var newSkills = dto.SkillIds.Select(skillId => new GraduateSkill
                {
                    GraduateId = userId,
                    SkillId = skillId 
                }).ToList();
                _context.GraduateSkills.AddRange(newSkills);
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Habilidades actualizadas correctamente." });
        }
    }
}