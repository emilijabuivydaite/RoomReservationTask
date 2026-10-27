using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using RoomBooking.Api.Data;
using RoomBooking.Api.Dtos;
using RoomBooking.Api.Models;

namespace RoomBooking.Api.Endpoints;

public static class UsersEndpoints
{
    const string GetUserEndpointName = "GetUser";

    // One shared projection, so every endpoint returns the same shape
    private static readonly Expression<Func<User, UserDto>> ToDto = u =>
        new UserDto(
            u.Id, 
            u.FirstName,
            u.LastName,
            u.Reservations.Count(r => r.Status == ReservationStatus.Booked));

    public static void MapUsersEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/users");
        
        // GET /users
        group.MapGet("/", async (RoomBookingContext db) =>
            await db.Users
                .OrderBy(u => u.LastName)
                .ThenBy(u => u.FirstName)
                .Select(ToDto)
                .ToListAsync());

        // GET /users/{id}
        group.MapGet("/{id}", async (int id, RoomBookingContext db) =>
        {
            var user = await db.Users
                .Where(r => r.Id == id)
                .Select(ToDto)
                .SingleOrDefaultAsync();

            return user is null ? Results.NotFound() : Results.Ok(user);
        })
        .WithName(GetUserEndpointName);
    }
}
