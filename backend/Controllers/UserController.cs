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
    public class UserDto
    {
        [Required(ErrorMessage = "Korisničko ime je obavezno.")]
        [StringLength(20, MinimumLength = 3)]
        public required string Username { get; set; }

        [Required]
        [EmailAddress(ErrorMessage = "Neispravan format emaila.")]
        public required string Email { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = "Lozinka mora imati barem 8 znakova.")]
        public required string Password { get; set; }
    }


    public class UserLoginDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }


    public class UserGetDto
    {
        public Guid Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public string? PickedTheme { get; set; }
        public DateTime CreatedAt { get; set; }
    }


    public class UserUpdateDto
    {
        public string? Username { get; set; }
        public string? PickedTheme { get; set; }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////   

    //  -- KREIRANJE KORISNIKA --

    //  -- LOGIN KORISNIKA --

    //  -- DOHVAĆANJE PODATAKA O KORISNIKU --

    //  -- AŽURIRANJE PODATAKA O KORISNIKU --

    //  -- BRISANJE KORISNIKA ( SOFT DELETE ) --

    /////////////////////////////////////////////// :



    [Route("api/user")]
    [ApiController]
    public class UserController(AppDbContext context, IConfiguration config) : ControllerBase
    {


        public readonly AppDbContext _context = context;
        private readonly IConfiguration _config = config;



        [HttpPost] // KREIRANJE KORISNIKA
        public async Task<IActionResult> CreateUser([FromBody] UserDto userDto)
        {
            
            if (await _context.Users.AnyAsync(u => u.Email == userDto.Email))
                return BadRequest("Korisnik s ovim emailom već postoji.");

            var userModel = new User
            {
                Id = Guid.NewGuid(),
                Username = userDto.Username,
                Email = userDto.Email,
                Password = userDto.Password,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(userModel);

            await _context.SaveChangesAsync();



            // --- LOGIKA ZA TOKEN 
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userModel.Id.ToString()),
                new Claim(ClaimTypes.Email, userModel.Email),
                new Claim("Username", userModel.Username)
             };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(60),
                signingCredentials: credentials);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            // -----------------------------------------------------------------------



            return CreatedAtAction(nameof(GetUser), new { id = userModel.Id }, new
            {
                Token = tokenString,
                Username = userModel.Username,
                Id = userModel.Id
            });
        }



        [HttpPost("login")] // -- LOGIN KORISNIKA --
        public async Task<IActionResult> Login([FromBody] UserLoginDto login)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == login.Email && u.DeletedAt == null);

            if (user == null || user.Password != login.Password)
            {
                return Unauthorized("Pogrešan email ili lozinka.");
            }

            // kreiranje tokena
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("Username", user.Username)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(60), // token vrijedi 1 sat
                signingCredentials: credentials);

            return Ok(new
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Username = user.Username, 
                Id = user.Id 
            });
            // kad se korisnik uspjesno prijavi, API mu vraća dugacak niz znakova, odnosni token
        }



        [HttpGet("{id}")] // -- DOHVAĆANJE PODATAKA O KORISNIKU --
        public async Task<IActionResult> GetUser(Guid id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.DeletedAt == null);

            if (user == null) return NotFound();

            return Ok(new UserGetDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                PickedTheme = user.PickedTheme,
                CreatedAt = user.CreatedAt
            });
        }



        [HttpPut("{id}")] // -- AŽURIRANJE PODATAKA O KORISNIKU --
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UserUpdateDto updateDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.DeletedAt == null);

            if (user == null) return NotFound();

            if (updateDto.Username != null) user.Username = updateDto.Username;
            if (updateDto.PickedTheme != null) user.PickedTheme = updateDto.PickedTheme;

            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok("Podaci uspješno ažurirani.");
        }



        [Authorize]
        [HttpDelete("{id}")] // -- BRISANJE KORISNIKA ( SOFT DELETE ) --
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            // izvlacenje id-a korisnika iz tokena
            var userIdFromToken = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (userIdFromToken == null)
            {
                return Unauthorized("Nevažeći token.");
            }

            if (userIdFromToken != id.ToString())
            {
                return Forbid("Nemate dopuštenje za brisanje tuđeg profila.");
            }

            // ako je sve u redu, izvrsi soft delete
            var user = await _context.Users
                                     .Where(u => u.Id == id && u.DeletedAt == null)
                                     .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound("Korisnik nije pronađen.");
            }

            user.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok("Korisnički profil je uspješno deaktiviran.");
        }
    }
}