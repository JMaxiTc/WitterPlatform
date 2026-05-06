using Microsoft.EntityFrameworkCore;
using Witter.Api.Models;

namespace Witter.Api.Data
{
    public class WitterDbContext : DbContext
    {
        public WitterDbContext(DbContextOptions<WitterDbContext> options) : base(options)
        {
        }

        // Definición de las tablas
        public DbSet<User> Users { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<GraduateProfile> GraduateProfiles { get; set; }
        public DbSet<CompanyProfile> CompanyProfiles { get; set; }
        public DbSet<Project> Projects { get; set; }
        
        // Tablas intermedias (N:M)
        public DbSet<GraduateSkill> GraduateSkills { get; set; }
        public DbSet<ProjectSkill> ProjectSkills { get; set; }
        public DbSet<Milestone> Milestones { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<Submission> Submissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configurar llaves primarias compuestas para las tablas N:M
            modelBuilder.Entity<GraduateSkill>()
                .HasKey(gs => new { gs.GraduateId, gs.SkillId });

            modelBuilder.Entity<ProjectSkill>()
                .HasKey(ps => new { ps.ProjectId, ps.SkillId });

            // Relación 1:1 entre User y perfiles
            modelBuilder.Entity<GraduateProfile>()
                .HasOne<User>()
                .WithOne()
                .HasForeignKey<GraduateProfile>(gp => gp.UserId);

            modelBuilder.Entity<CompanyProfile>()
                .HasOne<User>()
                .WithOne()
                .HasForeignKey<CompanyProfile>(cp => cp.UserId);
        }
    }
}