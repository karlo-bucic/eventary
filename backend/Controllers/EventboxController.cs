using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using WebApplication1.Models;

using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Microsoft.AspNetCore.Authorization;


namespace WebApplication1.Controllers
{
    public class EventboxCreateDto
    {
        public required string Title { get; set; }
        public required string LocationCity { get; set; }
        public required string LocationStreet { get; set; }
        public int LocationStreetNumber { get; set; }
        public DateTime EventDate { get; set; }
        public int ExperienceScore { get; set; }
    }


    public class EventboxUpdateDto
    {
        public string? Title { get; set; }
        public string? LocationCity { get; set; }
        public string? LocationStreet { get; set; }
        public int? LocationStreetNumber { get; set; }
        public DateTime? EventDate { get; set; }
        public int? ExperienceScore { get; set; }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////

    // -- DOHVAĆANJE SVIH EVENTBOXOVA KORISNIKA --

    // -- DOHVAĆANJE JEDNOG EVENTBOXA KORISNIKA --

    // -- KREIRANJE JEDNOG EVENTBOXA KORISNIKA --

    // -- AŽURIRANJE JEDNOG EVENTBOXA KORISNIKA --

    // -- BRISANJE JEDNOG EVENTBOXA KORISNIKA --

    /////////////////////////////////////////////////// :



    [Authorize]
    [Route("api/eventbox")]
    [ApiController]
    public class EventboxController(AppDbContext context) : ControllerBase
    {


        public readonly AppDbContext _context = context;



        [HttpGet] // -- DOHVAĆANJE SVIH EVENTBOXOVA JEDNOG KORISNIKA --
        public async Task<ActionResult<IEnumerable<Eventbox>>> GetAll()
        {
            // izvlacenje id-a prijavljenog korisnika iz tokena
            var userIdFromToken = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdFromToken == null) return Unauthorized();

            // vracanje samo onih zapisa koji nisu obrisani
            return await _context.Eventboxes
                .Include(e => e.Images)
                .Where(e => e.UserId.ToString() == userIdFromToken && e.DeletedAt == null)
                .ToListAsync();
        }



        [HttpGet("{id}")] // -- DOHVAĆANJE JEDNOG EVENTBOXA KORISNIKA --  po id-u eventboxa
        public async Task<ActionResult<Eventbox>> GetById(Guid id)
        {
            // izvlacenje id-a prijavljenog korisnika iz tokena
            var userIdFromToken = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (userIdFromToken == null)
                return Unauthorized("Niste prijavljeni.");

            // trazenje zapisa po ID-u, uz uvjet da vlasnik mora biti taj korisnik
            var eventItem = await _context.Eventboxes
                .Include(e => e.User)
                .Include(e => e.Images)
                .FirstOrDefaultAsync(e => e.Id == id &&
                                          e.UserId.ToString() == userIdFromToken &&
                                          e.DeletedAt == null);

            if (eventItem == null)
                return NotFound("Eventbox nije pronađen ili nemate dozvolu za pristup.");

            return Ok(eventItem);
        }



        [HttpPost] // -- KREIRANJE JEDNOG EVENTBOXA KORISNIKA --
        public async Task<ActionResult<Eventbox>> Create(

            [FromForm] EventboxCreateDto dto, 
            IFormFile vertical,            
            IFormFile top,                    
            IFormFile bottom                
        )
        {
            var userIdFromToken = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdFromToken == null) return Unauthorized();

            var eventImages = new EventImages
            {
                Id = Guid.NewGuid(), // baza generira ID, ali možemo i sami
                ImageVerticalBase64 = await ConvertFileToBase64(vertical),
                ImageSquareTopBase64 = await ConvertFileToBase64(top),
                ImageSquareBottomBase64 = await ConvertFileToBase64(bottom)
            };

            var newEvent = new Eventbox
            {
                Title = dto.Title,
                LocationCity = dto.LocationCity,
                LocationStreet = dto.LocationStreet,
                LocationStreetNumber = dto.LocationStreetNumber,
                EventDate = dto.EventDate.ToUniversalTime(),
                ExperienceScore = dto.ExperienceScore,
                CreatedAt = DateTime.UtcNow,

                UserId = Guid.Parse(userIdFromToken),
                Images = eventImages
            };

            _context.Eventboxes.Add(newEvent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = newEvent.Id }, newEvent);
        }


        // pomoćne metode
        private async Task<string?> ConvertFileToBase64(IFormFile file)
        {
            if (file == null || file.Length == 0) return null;

            using (var ms = new MemoryStream())
            {
                await file.CopyToAsync(ms);
                byte[] fileBytes = ms.ToArray();
                return Convert.ToBase64String(fileBytes);
            }
        }
        // pomoćne metode



        [HttpPut("{id}")] // -- AŽURIRANJE JEDNOG EVENTBOXA KORISNIKA --
        public async Task<IActionResult> Update(Guid id, EventboxUpdateDto dto)
        {

            var userIdFromToken = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (userIdFromToken == null)
                return Unauthorized("Nevažeći token.");

            // zapis mora pripadati korisniku iz tokena i ne smije biti obrisan
            var eventItem = await _context.Eventboxes
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId.ToString() == userIdFromToken && e.DeletedAt == null);

            if (eventItem == null)
                return NotFound("Eventbox ne postoji ili mu ne možete pristupiti.");

            if (dto.Title != null) eventItem.Title = dto.Title;
            if (dto.LocationCity != null) eventItem.LocationCity = dto.LocationCity;
            if (dto.LocationStreet != null) eventItem.LocationStreet = dto.LocationStreet;
            if (dto.LocationStreetNumber.HasValue) eventItem.LocationStreetNumber = dto.LocationStreetNumber.Value;
            if (dto.EventDate.HasValue) eventItem.EventDate = dto.EventDate.Value;
            if (dto.ExperienceScore.HasValue) eventItem.ExperienceScore = dto.ExperienceScore.Value;

            eventItem.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok("Zapis u dnevniku je uspješno ažuriran.");
        }



        [HttpDelete("{id}")] // -- BRISANJE JEDNOG EVENTBOXA KORISNIKA --
        public async Task<IActionResult> Delete(Guid id)
        {
            var userIdFromToken = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var eventItem = await _context.Eventboxes
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId.ToString() == userIdFromToken);

            if (eventItem == null)
                return NotFound("Zapis nije pronađen ili nemate ovlasti.");

            eventItem.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok("Zapis iz dnevnika je obrisan.");
        }
    }
}
