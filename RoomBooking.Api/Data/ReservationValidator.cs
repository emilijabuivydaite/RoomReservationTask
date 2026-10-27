using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RoomBooking.Api.Data;
using RoomBooking.Api.Dtos;
using RoomBooking.Api.Models;
using RoomBooking.Api.Services;

public record ValidationError(string Code, string Message);

public class ReservationValidator(
    RoomBookingContext db,
    IOptions<BookingRules> rules,
    TimeProvider clock)
{
    private readonly BookingRules _rules = rules.Value;
    public async Task<ValidationError?> ValidateAsync(
        UpdateReservationDto newReservation, 
        int? excludeReservationId)
    {
        var now = clock.GetUtcNow().UtcDateTime;

        // Check if selected room exists
        var room = await db.Rooms.FindAsync(newReservation.RoomId);
        if (room is null)
            return new("ROOM_NOT_FOUND", "The selected room does not exist.");

        var organizerExists = await db.Users.AnyAsync(u => u.Id == newReservation.OrganizerId);
        if (!organizerExists)
            return new("ORGANIZER_NOT_FOUND", "The selected organizer does not exist.");

        // Check if end time is after start time
        if (newReservation.End <= newReservation.Start)
            return new("INVALID_TIME_RANGE", "The end time must be after the start time.");

        // R1: A single reservation cannot last longer than 7 days. 
        // Exactly 7 days is allowed.
        if (newReservation.End - newReservation.Start > TimeSpan.FromDays(_rules.MaxDurationDays))
            return new("R1_MAX_DURATION", $"A reservation cannot last longer than {_rules.MaxDurationDays} days.");

        // R2: A room cannot have two active reservations. 
        // Cancelled reservation does not block the room. 
        var roomBusy = await db.Reservations.AnyAsync(r =>
            r.RoomId == newReservation.RoomId
            && r.Status == ReservationStatus.Booked
            && r.Id != excludeReservationId
            && r.Start < newReservation.End
            && r.End > newReservation.Start);
        if (roomBusy)
            return new("R2_MAX_DURATION", "This room is already booked for the selected time.");

        // R3: The same user cannot organize two meetings that overlap in date, even in different rooms.
        var organizerBusy = await db.Reservations.AnyAsync(r =>
            r.OrganizerId == newReservation.OrganizerId
            && r.Status == ReservationStatus.Booked
            && r.Id != excludeReservationId
            && r.Start < newReservation.End
            && r.End > newReservation.Start);
        if (organizerBusy)
            return new("R3_ORGANIZER_OVERLAP", "The organizer already has a meeting at the selected time.");

        // R4: start must be in the future
        if (newReservation.Start <= now)
            return new("R4_VALID_TIME_RANGE", "The start time must be in the future.");
        
        // R5: Number of attendees must not exceed the room capacity. 
        if (newReservation.Attendees > room.Capacity)
            return new("R5_CAPACITY", $"The room holds at most {room.Capacity} people, but {newReservation.Attendees} attendees were given.");
        
        // R6: A reservation cannot start more than 90 days in the future. 
        if (newReservation.Start > now.AddDays(_rules.MaxAdvanceDays))
            return new("R6_BOOKING_HORIZON", $"A reservation cannot start more than {_rules.MaxAdvanceDays} days in the future.");

        // R7: Inactive rooms cannot be booked. 
        if (!room.IsActive)
            return new("R6_ROOM_INACTIVE", "This room is inactive and cannot be booked.");

        return null;
    }
}