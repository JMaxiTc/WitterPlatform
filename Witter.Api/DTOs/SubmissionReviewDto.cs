namespace Witter.Api.DTOs
{
    public class SubmissionReviewDto
    {
        public bool IsApproved { get; set; }
        public string? Feedback { get; set; } = string.Empty;
    }
}