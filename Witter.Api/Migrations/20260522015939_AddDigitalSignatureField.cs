using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Witter.Api.Migrations
{
    public partial class AddDigitalSignatureField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DigitalSignature",
                table: "Submissions",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DigitalSignature",
                table: "Submissions");
        }
    }
}