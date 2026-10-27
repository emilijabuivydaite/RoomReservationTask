namespace RoomBooking.Api.Models;

public class User
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public List<Reservation> Reservations { get; set; } = [];
}
