namespace RoomBooking.Api.Models;

public class Room
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required int Capacity { get; set; }
    public required int Floor { get; set; }
    public required Equipment Equipment { get; set; }
    public bool IsActive { get; set; }
}
