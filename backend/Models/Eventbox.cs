// klasa Eventbox

namespace WebApplication1.Models;

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Eventbox {

    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // baza generira ID
    public Guid Id { get; set; }

    [MaxLength(50)]
    public required string Title { get; set; }

    [MaxLength(20)]
    public required string LocationCity { get; set; }

    [MaxLength(50)]
    public required string LocationStreet { get; set; }

    [Range(1, 999)]
    public int LocationStreetNumber { get; set; }

    public DateTime EventDate { get; set; }

    [Range(1, 5)]
    public int ExperienceScore { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; } // možda nikad neće biti updejtano

    public DateTime? DeletedAt { get; set; } // možda nikad neće biti deletano


    // FK - user

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;


    // FK - images

    public Guid? ImagesId { get; set; }

    [ForeignKey("ImagesId")]
    public EventImages? Images { get; set; } = null!;

}
