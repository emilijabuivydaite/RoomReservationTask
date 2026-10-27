using RoomBooking.Api.Models;

namespace RoomBooking.Api.Data;

public static class DbSeeder
{
    public static void Seed(RoomBookingContext db)
    {
        if (db.Rooms.Any()) return;

        db.Rooms.AddRange(
            new Room { Name = "R1", Capacity = 5, Floor = 2, Equipment = Equipment.Projector | Equipment.TvScreen, IsActive = true },
            new Room { Name = "R2", Capacity = 2, Floor = 1, Equipment = Equipment.None, IsActive = true },
            new Room { Name = "R3", Capacity = 20, Floor = 3, Equipment = Equipment.Whiteboard, IsActive = false },
            new Room { Name = "R4", Capacity = 5, Floor = 10, Equipment = Equipment.VideoConferencing, IsActive = false },
            new Room { Name = "R5", Capacity = 35, Floor = 5, Equipment = Equipment.VideoConferencing | Equipment.Projector | Equipment.TvScreen | Equipment.Whiteboard, IsActive = true });

        db.Users.AddRange(
            new User { FirstName = "Name1", LastName = "LastName1" },
            new User { FirstName = "Name2", LastName = "LastName2" },
            new User { FirstName = "Name3", LastName = "LastName3" },
            new User { FirstName = "Name4", LastName = "LastName4" },
            new User { FirstName = "Name5", LastName = "LastName5" });

        db.SaveChanges();
    }
}