using Microsoft.EntityFrameworkCore;
using RoomBooking.Api.Data;
using RoomBooking.Api.Dtos;
using RoomBooking.Api.Models;

namespace RoomBooking.Api.Endpoints;

public static class RoomsEndpoints
{
    const string GetRoomEndpointName = "GetRoom";

    private static RoomDto ToDto(Room r) => new(
        r.Id, r.Name,
        r.Capacity,
        r.Floor, 
        Enum.GetValues<Equipment>()
            .Where(e => e != Equipment.None && r.Equipment.HasFlag(e))
            .Select(e => e.ToString())
            .ToList(), 
        r.IsActive);

    public static void MapRoomsEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/rooms");
        
        // GET /rooms
        group.MapGet("/", async (
            RoomBookingContext db,
            int? minCapacity,
            int? floor,
            Equipment[]? equipment) =>
        {
            var query = db.Rooms.AsQueryable();

            if (minCapacity is not null) query = query.Where(r => r.Capacity >= minCapacity);
            if (floor is not null) query = query.Where(r => r.Floor == floor);

            // room must have ALL selected equipment
            var wanted = equipment?.Aggregate(Equipment.None, (all, e) => all | e) ?? Equipment.None;
            if (wanted != Equipment.None)
                query = query.Where(r => (r.Equipment & wanted) == wanted);

            var rooms = await query
                .OrderBy(r => r.Floor)
                .ThenBy(r => r.Name)
                .ToListAsync();

            return rooms.Select(ToDto);
        });

        // GET /rooms/{id}
        group.MapGet("/{id}", async (int id, RoomBookingContext db) =>
        {
            var room = await db.Rooms.FindAsync(id);

            return room is null ? Results.NotFound() : Results.Ok(room);
        })
        .WithName(GetRoomEndpointName);
    }
}
