namespace Witter.Api.DTOs
{
    public class CompanyRegisterDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string CompanyName { get; set; }
        public string RFC { get; set; }
        public string Website { get; set; }
        public string Sector { get; set; }
    }
}