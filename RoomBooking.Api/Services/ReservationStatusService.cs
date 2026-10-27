using Microsoft.EntityFrameworkCore;
using RoomBooking.Api.Data;
using RoomBooking.Api.Models;

namespace RoomBooking.Api.Services;

public class ReservationStatusService(RoomBookingContext db, TimeProvider clock)
{
    public async Task CompleteFinishedAsync()
    {
        var now = clock.GetUtcNow().UtcDateTime;

        var finished = await db.Reservations
            .Where(r => r.Status == ReservationStatus.Booked && r.End <= now)
            .ToListAsync();

        if (finished.Count == 0) return;

        foreach (var reservation in finished)
            reservation.Status = ReservationStatus.Completed;

        await db.SaveChangesAsync();
    }
}