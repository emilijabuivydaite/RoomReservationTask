namespace RoomBooking.Api.Models;

public class Reservation
{
    public int Id { get; set; }
    public int RoomId { get; set; }                 // foreign key
    public Room Room { get; set; } = null!;         // navigation property
    public int OrganizerId { get; set; }            // foreign key
    public User Organizer { get; set; } = null!;    // navigation property
    public required string Title { get; set; }
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public int Attendees { get; set; }
    public ReservationStatus Status { get; set; }
}
