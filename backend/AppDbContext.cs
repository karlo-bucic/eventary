using Microsoft.EntityFrameworkCore;    

namespace WebApplication1.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<EventImages> EventImages { get; set; } = null!;
        public DbSet<Eventbox> Eventboxes { get; set; } = null!; 

    }
}
