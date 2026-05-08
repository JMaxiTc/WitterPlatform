using System;
using System.ComponentModel.DataAnnotations;

namespace Witter.Api.Models
{
    public class CompanyProfile
    {
        [Key]
        public Guid UserId { get; set; }
        public string CompanyName { get; set; }
        public string RFC { get; set; }
        public string Website { get; set; }
        public string ? LogoUrl { get; set; }
        public string Sector { get; set; }
        public string ? StripeCustId { get; set; }
    }
}