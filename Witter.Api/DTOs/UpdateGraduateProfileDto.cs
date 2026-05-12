namespace Witter.Api.DTOs
{
    public class UpdateGraduateProfileDto
    {
        public string? School { get; set; }
        public string? Campus { get; set; }
        public string? Degree { get; set; }
        public int? EgressYear { get; set; }
        public string? LicenseId { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public string? PortfolioUrl { get; set; }
        public string? GithubUrl { get; set; }
        public string? LinkedinUrl { get; set; }
        public string? StripeAccId { get; set; }
    }
}