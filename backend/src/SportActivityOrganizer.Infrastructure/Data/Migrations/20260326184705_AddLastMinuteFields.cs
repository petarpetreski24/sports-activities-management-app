using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportActivityOrganizer.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLastMinuteFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsLastMinute",
                table: "SportEvents",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastMinuteAt",
                table: "SportEvents",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsLastMinute",
                table: "SportEvents");

            migrationBuilder.DropColumn(
                name: "LastMinuteAt",
                table: "SportEvents");
        }
    }
}
