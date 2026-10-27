namespace RoomBooking.Api.Services;

public class BookingRules
{
    public int MaxDurationDays { get; set; } = 7;
    public int MaxAdvanceDays { get; set; } = 90;
}