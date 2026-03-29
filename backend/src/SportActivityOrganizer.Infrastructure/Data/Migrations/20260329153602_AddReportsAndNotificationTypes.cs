using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SportActivityOrganizer.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddReportsAndNotificationTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:application_status", "pending,approved,rejected,cancelled")
                .Annotation("Npgsql:Enum:event_status", "open,full,in_progress,completed,cancelled")
                .Annotation("Npgsql:Enum:notification_type", "application_received,application_approved,application_rejected,event_updated,event_cancelled,event_reminder,new_comment,event_full,report_resolved")
                .Annotation("Npgsql:Enum:report_reason", "inappropriate_behavior,spam,harassment,fake_profile,no_show,other")
                .Annotation("Npgsql:Enum:report_status", "pending,reviewed,resolved,dismissed")
                .Annotation("Npgsql:Enum:skill_level", "beginner,intermediate,advanced,professional")
                .Annotation("Npgsql:Enum:user_role", "user,admin")
                .OldAnnotation("Npgsql:Enum:application_status", "pending,approved,rejected,cancelled")
                .OldAnnotation("Npgsql:Enum:event_status", "open,full,in_progress,completed,cancelled")
                .OldAnnotation("Npgsql:Enum:notification_type", "application_received,application_approved,application_rejected,event_updated,event_cancelled,event_reminder,new_comment")
                .OldAnnotation("Npgsql:Enum:skill_level", "beginner,intermediate,advanced,professional")
                .OldAnnotation("Npgsql:Enum:user_role", "user,admin");

            migrationBuilder.CreateTable(
                name: "Reports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReporterId = table.Column<int>(type: "integer", nullable: false),
                    ReportedUserId = table.Column<int>(type: "integer", nullable: true),
                    ReportedEventId = table.Column<int>(type: "integer", nullable: true),
                    ReportedCommentId = table.Column<int>(type: "integer", nullable: true),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AdminNotes = table.Column<string>(type: "text", nullable: true),
                    ResolvedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reports_EventComments_ReportedCommentId",
                        column: x => x.ReportedCommentId,
                        principalTable: "EventComments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reports_SportEvents_ReportedEventId",
                        column: x => x.ReportedEventId,
                        principalTable: "SportEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reports_Users_ReportedUserId",
                        column: x => x.ReportedUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reports_Users_ReporterId",
                        column: x => x.ReporterId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reports_Users_ResolvedByUserId",
                        column: x => x.ResolvedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reports_ReportedCommentId",
                table: "Reports",
                column: "ReportedCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_ReportedEventId",
                table: "Reports",
                column: "ReportedEventId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_ReportedUserId",
                table: "Reports",
                column: "ReportedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_ReporterId",
                table: "Reports",
                column: "ReporterId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_ResolvedByUserId",
                table: "Reports",
                column: "ResolvedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Reports");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:application_status", "pending,approved,rejected,cancelled")
                .Annotation("Npgsql:Enum:event_status", "open,full,in_progress,completed,cancelled")
                .Annotation("Npgsql:Enum:notification_type", "application_received,application_approved,application_rejected,event_updated,event_cancelled,event_reminder,new_comment")
                .Annotation("Npgsql:Enum:skill_level", "beginner,intermediate,advanced,professional")
                .Annotation("Npgsql:Enum:user_role", "user,admin")
                .OldAnnotation("Npgsql:Enum:application_status", "pending,approved,rejected,cancelled")
                .OldAnnotation("Npgsql:Enum:event_status", "open,full,in_progress,completed,cancelled")
                .OldAnnotation("Npgsql:Enum:notification_type", "application_received,application_approved,application_rejected,event_updated,event_cancelled,event_reminder,new_comment,event_full,report_resolved")
                .OldAnnotation("Npgsql:Enum:report_reason", "inappropriate_behavior,spam,harassment,fake_profile,no_show,other")
                .OldAnnotation("Npgsql:Enum:report_status", "pending,reviewed,resolved,dismissed")
                .OldAnnotation("Npgsql:Enum:skill_level", "beginner,intermediate,advanced,professional")
                .OldAnnotation("Npgsql:Enum:user_role", "user,admin");
        }
    }
}
