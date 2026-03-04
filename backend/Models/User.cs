// klasa User

namespace WebApplication1.Models;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class User {

    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // baza generira ID
    public Guid Id { get; set; } // Guid je integer na stereoidima koji se koristi za baze

    [MaxLength(50)]
    public required string Username { get; set; }

    [MaxLength(50)]
    public required string Password { get; set; }

    [MaxLength(50)]
    [EmailAddress]
    public required string Email { get; set; }

    public string? PickedTheme { get; set; } // opcionalno

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; } // možda nikad neće biti updejtano

    public DateTime? DeletedAt { get; set; } // možda nikad neće biti deletano

}
