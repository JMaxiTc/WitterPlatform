using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Antiforgery;
using System.Security.Claims;
using System.Text;
using Witter.Api.Data;
using Witter.Api.DTOs;
using Google.Apis.Auth;

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

        [HttpGet("csrf-token")]
        [IgnoreAntiforgeryToken]
        public IActionResult GetCsrfToken([FromServices] IAntiforgery antiforgery)
        {
            try
            {
                // Genera y almacena el token CSRF en cookie 
                var tokens = antiforgery.GetAndStoreTokens(HttpContext);
                
                // Retornamos el RequestToken al cliente
                return Ok(new { csrfToken = tokens.RequestToken });
            } catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error generando CSRF", Details = ex.Message });
            }
        }

        [HttpPost("login")]
        [IgnoreAntiforgeryToken]
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
                // Administradores se usara el inicio del correo (antes del @)
                fullName = user.Email.Split('@')[0];
                // Mayus la primera letra para mejor presentación
                if (!string.IsNullOrEmpty(fullName))
                {
                    fullName = char.ToUpper(fullName[0]) + fullName.Substring(1);
                }
            }

            // Generar token JWT con info del usuario
            var token = GenerateJwtToken(user.Id.ToString(), user.Email, user.UserRole);

            Response.Cookies.Delete("WitterAuthToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            });

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddHours(2),
                Path = "/"
            };

            Response.Cookies.Append("WitterAuthToken", token, cookieOptions);

            return Ok(new {
                Message = "Login exitoso",
                Role = user.UserRole,
                UserId = user.Id,
                FullName = fullName
                });
        }

        [HttpPost("google-login")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto googleLoginData)
        {
            try
            {
                // Configuración de validación de Google
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    // Puedes especificar qué Client ID(s) son válidos si lo requieres.
                    // Audience = new List<string>() { _configuration["Google:ClientId"] }
                };

                // Validamos el token JWT de google, si es inválido se lanzará una excepción
                var payload = await GoogleJsonWebSignature.ValidateAsync(googleLoginData.Token, settings);
                
                // Buscar si existe un usuario con ese correo
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);
                
                string fullName = payload.Name ?? payload.Email;

                if (user == null)
                {
                    // Si el usuario no existe, creamos su cuenta automáticamente con el rol "Graduate" (Egresado)
                    user = new Models.User
                    {
                        Id = Guid.NewGuid(),
                        Email = payload.Email,
                        PasswordHash = "", // Sin contraseña, ya que usa SSO
                        UserRole = "Graduate", 
                        CreatedAt = DateTime.UtcNow,
                        IsKycVerified = false,
                        IsApproved = true // Egresados no requieren aprobación por defecto
                    };

                    _context.Users.Add(user);

                    // Agregamos también su perfil básico de egresado
                    var newProfile = new Models.GraduateProfile
                    {
                        UserId = user.Id,
                        FirstName = payload.GivenName ?? "Usuario",
                        LastName = payload.FamilyName ?? "Google",
                        DateOfBirth = DateTime.UtcNow
                    };

                    _context.GraduateProfiles.Add(newProfile);
                    await _context.SaveChangesAsync();

                    fullName = $"{newProfile.FirstName} {newProfile.LastName}";
                }
                else
                {
                    if (!user.IsApproved)
                    {
                        return Unauthorized(new { Message = "Tu cuenta está en revisión por el Superusuario. Te notificaremos pronto." });
                    }

                    // Obtener el nombre correspondiente al perfil existente
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
                        fullName = user.Email.Split('@')[0];
                        if (!string.IsNullOrEmpty(fullName))
                        {
                            fullName = char.ToUpper(fullName[0]) + fullName.Substring(1);
                        }
                    }
                }

                // Generamos el propio token de autorización
                var token = GenerateJwtToken(user.Id.ToString(), user.Email, user.UserRole);

                Response.Cookies.Delete("WitterAuthToken", new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Path = "/"
                });

                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTime.UtcNow.AddHours(2),
                    Path = "/"
                };

                Response.Cookies.Append("WitterAuthToken", token, cookieOptions);

                return Ok(new
                {
                    Message = "Login exitoso con Google",
                    Role = user.UserRole,
                    UserId = user.Id,
                    FullName = fullName
                });
            }
            catch (InvalidJwtException)
            {
                return Unauthorized(new { Message = "El token de Google es inválido." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Ocurrió un error authenticando con google.", Details = ex.Message });
            }
        }

        [HttpPost("logout")]
        [ValidateAntiForgeryToken]
        public IActionResult Logout()
        {
            // Esto le indica al navegador que la cookie "WitterAuthToken"
            // ha expirado, obligándolo a borrarla inmediatamente.
            Response.Cookies.Delete("WitterAuthToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            });

            return Ok(new { Message = "Sesión cerrada correctamente" });
        }

        private string GenerateJwtToken(string userId, string email, string role)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is missing"));

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
}