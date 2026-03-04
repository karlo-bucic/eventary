
// ovaj file je middleware

// sve sta tu stavimo ce se pokrenuti dok dode do nasih endpointa

//---------------------------------------------------------------------

using WebApplication1.Models;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ovime smo registrirali konekciju na našu bazu



builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });



builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Tocan port mog Vite projekta
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Vazno ako budem kasnije koristio kolacice
    });
});




var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(opt => 
    {
        opt.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");

    });
}

app.UseHttpsRedirection();

app.UseRouting();


// aktivacija CORS-a - mora biti IZMEDU UseRouting i UseAuthorization !
app.UseCors("AllowReactApp");

// ( mora ici prije MapControllers )
app.UseAuthentication(); // Tko si ti?
app.UseAuthorization();  // sto smiješ raditi?


app.MapControllers();

app.Run();
