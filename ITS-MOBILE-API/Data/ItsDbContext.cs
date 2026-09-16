using Microsoft.EntityFrameworkCore;
using ITS_MOBILE_API.Models;

namespace ITS_MOBILE_API.Data;

public class ItsDbContext : DbContext
{
    public ItsDbContext(DbContextOptions<ItsDbContext> options) : base(options) { }

    // Auth & Users
    public DbSet<AbpUser> AbpUsers => Set<AbpUser>();
    public DbSet<AbpUserLogin> AbpUserLogins => Set<AbpUserLogin>();
    public DbSet<AbpUserRole> AbpUserRoles => Set<AbpUserRole>();
    public DbSet<AbpRole> AbpRoles => Set<AbpRole>();
    public DbSet<AbpUserOrganizationUnit> AbpUserOrganizationUnits => Set<AbpUserOrganizationUnit>();
    public DbSet<AbpOrganizationUnit> AbpOrganizationUnits => Set<AbpOrganizationUnit>();

    // Tasks & Incidents
    public DbSet<TaskOfIncident> TaskOfIncidents => Set<TaskOfIncident>();
    public DbSet<WorkerTaskIncident> WorkerTaskIncidents => Set<WorkerTaskIncident>();
    public DbSet<IncidentProfile> IncidentProfiles => Set<IncidentProfile>();
    public DbSet<IncidentLog> IncidentLogs => Set<IncidentLog>();
    public DbSet<TaskOfScript> TaskOfScripts => Set<TaskOfScript>();
    public DbSet<WorkerInfo> WorkerInfos => Set<WorkerInfo>();

    // Directory & PBX
    public DbSet<Extension> Extensions => Set<Extension>();
    public DbSet<ExtensionDetail> ExtensionDetails => Set<ExtensionDetail>();
    public DbSet<IpPhone> IpPhones => Set<IpPhone>();
    public DbSet<CallHistory> CallHistories => Set<CallHistory>();
    public DbSet<AsteriskCDR> AsteriskCDRs => Set<AsteriskCDR>();

    // Events & Notifications
    public DbSet<EventInfo> EventInfos => Set<EventInfo>();
    public DbSet<AbpUserNotification> AbpUserNotifications => Set<AbpUserNotification>();
    public DbSet<AbpNotification> AbpNotifications => Set<AbpNotification>();

    // Attachments
    public DbSet<FilesOfIncident> FilesOfIncidents => Set<FilesOfIncident>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema("dbo");
    }
}
