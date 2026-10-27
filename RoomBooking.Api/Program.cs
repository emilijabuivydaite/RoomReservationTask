using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using RoomBooking.Api.Data;
using RoomBooking.Api.Endpoints;
using RoomBooking.Api.Services;

// Creates the builder, which collects the app’s configuration and its services
var builder = WebApplication.CreateBuilder(args);

// Registers the real clock once
// Any class that asks for a TimeProvider gets it
builder.Services.AddSingleton(TimeProvider.System);
// Reads the BookingRules section from appsettings.json so IOptions<BookingRules> can be injected
builder.Services.Configure<BookingRules>(builder.Configuration.GetSection("BookingRules"));
// Registers the validator, with a new instance per request
builder.Services.AddScoped<ReservationValidator>();

// Registers database context and tells it to use the in-memory provider
builder.Services.AddDbContext<RoomBookingContext>(options =>
    options.UseInMemoryDatabase("RoomBooking"));

// Applies the string enum setting to every request and response
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// Lets the React dev server call the API
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy => policy
        .WithOrigins("http://localhost:5173")   // Vite's port
        .AllowAnyHeader()
        .AllowAnyMethod()));

builder.Services.AddScoped<ReservationStatusService>();

// Ends the service-registration phase and creates the app
var app = builder.Build();

// Creates a temporary scope to get a database context and run the seeder once at startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<RoomBookingContext>();
    DbSeeder.Seed(db);
}

// Turns on the CORS policy
app.UseCors();

// Calls extension methods to register the routes
app.MapRoomsEndpoints();
app.MapUsersEndpoints();
app.MapReservationsEndpoints();

// Starts the web server and keeps it running
app.Run();