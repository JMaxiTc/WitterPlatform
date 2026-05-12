using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Witter.Api.Data;

namespace Witter.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly WitterDbContext _context;

        public AuthController(IConfiguration configuration, WitterDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginData)
        {
            // Buscar al usuario por correo
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginData.Email);

            // Validar existencia y contraseña con BCrypt
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginData.Password, user.PasswordHash))
            {
                return Unauthorized(new { Message = "Credenciales incorrectas" });
            }

            if (!user.IsApproved)
            {
                return Unauthorized(new { Message = "Tu cuenta de empresa está en revisión por el Superusuario. Te notificaremos pronto." });
            }

            // Obtener el nombre correspondiente al perfil
            string fullName = user.Email;
            if (user.UserRole == "Graduate")
            {
                var profile = await _context.GraduateProfiles.FirstOrDefaultAsync(p => p.UserId == user.Id);
                if (profile != null) fullName = $"{profile.FirstName} {profile.LastName}";
            }
            else if (user.UserRole == "Company")
            {
                var profile = await _context.CompanyProfiles.FirstOrDefaultAsync(p => p.UserId == user.Id);
                if (profile != null) fullName = profile.CompanyName;
            }
            else if (user.UserRole == "Admin")
            {
                // Administradores no tienen tabla de perfil, usamos el inicio del correo (antes del @)
                fullName = user.Email.Split('@')[0];
                // Mayus la primera letra para mejor presentación
                if (!string.IsNullOrEmpty(fullName))
                {
                    fullName = char.ToUpper(fullName[0]) + fullName.Substring(1);
                }
            }

            // Generar el Token JWT usando los datos reales del usuario
            var token = GenerateJwtToken(user.Id.ToString(), user.Email, user.UserRole);

            return Ok(new { Token = token, Role = user.UserRole, UserId = user.Id, FullName = fullName });
        }

        private string GenerateJwtToken(string userId, string email, string role)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(ClaimTypes.Role, role), 
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(2),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }

    public class LoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}