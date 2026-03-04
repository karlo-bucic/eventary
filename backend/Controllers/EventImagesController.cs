using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Models; 
using Microsoft.AspNetCore.Authorization;


namespace WebApplication1.Controllers

{

    [Authorize]
    [Route("api/eventimages")]
    [ApiController]
    public class EventImagesController(AppDbContext context) : ControllerBase
    {


        public readonly AppDbContext _context = context;



        [HttpGet("{eventId}")] // -- DOHVAĆANJE SVIH SLIKA ZA ODREĐENI EVENTBOX --
        public async Task<IActionResult> GetImagesByEventId(Guid eventId)
        {
            // Tražimo slike koje su povezane s Eventboxom preko stranog ključa
            var eventWithImages = await _context.Eventboxes
                .Include(e => e.Images)
                .FirstOrDefaultAsync(e => e.Id == eventId);

            if (eventWithImages?.Images == null)
                return NotFound("Slike za ovaj event nisu pronađene.");

            // Vraćamo objekt s prefiksima tako da ih frontend odmah može prikazati
            var response = new
            {
                Vertical = $"data:image/png;base64,{eventWithImages.Images.ImageVerticalBase64}",
                SquareTop = $"data:image/png;base64,{eventWithImages.Images.ImageSquareTopBase64}",
                SquareBottom = $"data:image/png;base64,{eventWithImages.Images.ImageSquareBottomBase64}"
            };

            return Ok(response);
        }

        //----------------------------------------------------------------------------------------------------

        [HttpDelete("{id}")] // -- BRISANJE SVIH TRIJU SLIKA ZA ODREĐENI EVENT --
        public async Task<IActionResult> DeleteImages(Guid id)
        {
            var images = await _context.EventImages.FindAsync(id);
            if (images == null) return NotFound();

            _context.EventImages.Remove(images);
            await _context.SaveChangesAsync();
            return Ok("Slike su obrisane iz baze.");
        }

        // MORAŠ IMPLEMENTIRAT Cascade Delete kako bi se skupa s eventboxom obrisale i slike

        // NE ŽELIŠ OSTAVLJAT SIROČAD U KODU

        //----------------------------------------------------------------------------------------------------
    }
}