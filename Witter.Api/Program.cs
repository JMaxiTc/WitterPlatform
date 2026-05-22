using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Witter.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Witter.Api.Services;

// Configuración de Servicios
var builder = WebApplication.CreateBuilder(args);

// Inyectar Servicio de Firma Digital Asimétrica (RSA)
builder.Services.AddSingleton<DigitalSignatureService>();

// Configurar Entity Framework con SQL Server
builder.Services.AddDbContext<WitterDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configurar JWT Auth & KYC
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing");
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

// Configuración de Autenticación JWT y Cookies
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
   options.TokenValidationParameters = new TokenValidationParameters
   {
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,
    ValidIssuer = builder.Configuration["Jwt:Issuer"],
    ValidAudience = builder.Configuration["Jwt:Audience"],
    IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
   }; 
   options.Events = new JwtBearerEvents
   {
       OnMessageReceived = context =>
       {
           if (context.Request.Cookies.ContainsKey("WitterAuthToken"))
           {
               context.Token = context.Request.Cookies["WitterAuthToken"];
           }
           return Task.CompletedTask;
       }
   };
   // Permitir el envío de cookies con solicitudes JWT
}).AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
{
    options.Cookie.Name = "WitterAuthToken";
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.Path = "/";
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();

// Configurar Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuración de CORS para permitir solicitudes desde el frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Ip del front
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Permitimos el envio de cookies para autenticar
    });
});

// Configuracion para protección CSRF
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest; // **CAMBIARRRRR**
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
});

// Filtro global para validar tken CSRF en todas las solicitudes (excepto GET)
builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
});


// Configuración de Pipelines HTTP
var app = builder.Build();

// Encabezados de Seguridad
app.Use(async (context, next) =>
{
    // Prevenir ataques de Clickjacking previniendo que la aplicacion se cargue en iframes
    context.Response.Headers.Append("X-Frame-Options","DENY");
    // Forzar al navegador activar la protección contra XSS
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    // Bloquea el MIME-Sniffing
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    // Política de seguridad para cargar contenido o recursos permitidos (solo misma app o Stripe)
    context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; script-src 'self'; connect-src 'self' https://api.stripe.com;");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

// Configurar el pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); 
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

// Primero Autentica y luego Autoriza
app.UseAuthentication(); 
app.UseAuthorization();  

app.MapControllers();

// Corre la Aplicación
app.Run();