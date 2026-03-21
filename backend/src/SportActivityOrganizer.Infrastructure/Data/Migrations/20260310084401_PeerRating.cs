using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportActivityOrganizer.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class PeerRating : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ParticipantRatings_Users_OrganizerId",
                table: "ParticipantRatings");

            migrationBuilder.DropIndex(
                name: "IX_ParticipantRatings_EventId_ParticipantId",
                table: "ParticipantRatings");

            migrationBuilder.RenameColumn(
                name: "OrganizerId",
                table: "ParticipantRatings",
                newName: "RaterId");

            migrationBuilder.RenameIndex(
                name: "IX_ParticipantRatings_OrganizerId",
                table: "ParticipantRatings",
                newName: "IX_ParticipantRatings_RaterId");

            migrationBuilder.CreateIndex(
                name: "IX_ParticipantRatings_EventId_RaterId_ParticipantId",
                table: "ParticipantRatings",
                columns: new[] { "EventId", "RaterId", "ParticipantId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ParticipantRatings_Users_RaterId",
                table: "ParticipantRatings",
                column: "RaterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ParticipantRatings_Users_RaterId",
                table: "ParticipantRatings");

            migrationBuilder.DropIndex(
                name: "IX_ParticipantRatings_EventId_RaterId_ParticipantId",
                table: "ParticipantRatings");

            migrationBuilder.RenameColumn(
                name: "RaterId",
                table: "ParticipantRatings",
                newName: "OrganizerId");

            migrationBuilder.RenameIndex(
                name: "IX_ParticipantRatings_RaterId",
                table: "ParticipantRatings",
                newName: "IX_ParticipantRatings_OrganizerId");

            migrationBuilder.CreateIndex(
                name: "IX_ParticipantRatings_EventId_ParticipantId",
                table: "ParticipantRatings",
                columns: new[] { "EventId", "ParticipantId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ParticipantRatings_Users_OrganizerId",
                table: "ParticipantRatings",
                column: "OrganizerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
