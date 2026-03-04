// klasa EventImages

namespace WebApplication1.Models;

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class EventImages {

    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // baza generira ID
    public Guid Id { get; set; }

    public string? ImageVerticalBase64 { get; set; }
    public string? ImageSquareTopBase64 { get; set; }
    public string? ImageSquareBottomBase64 { get; set; }

}
