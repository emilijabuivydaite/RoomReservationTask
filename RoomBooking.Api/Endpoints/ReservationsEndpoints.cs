using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using RoomBooking.Api.Data;
using RoomBooking.Api.Dtos;
using RoomBooking.Api.Models;
using RoomBooking.Api.Services;

namespace RoomBooking.Api.Endpoints;

public static class ReservationsEndpoints
{
    const string GetReservationEndpointName = "GetReservation";

    // One shared projection, so every endpoint returns the same shape
    private static readonly Expression<Func<Reservation, ReservationDto>> ToDto = r =>
        new ReservationDto(
            r.Id, r.RoomId, r.Room.Name,
            r.OrganizerId, r.Organizer.FirstName + " " + r.Organizer.LastName,
            r.Title, r.Start, r.End, r.Attendees, r.Status);

    private static IResult ValidationFailure(ValidationError error)
    {
        var body = new { code = error.Code, message = error.Message };
        return error.Code is "R2_ROOM_OVERLAP" or "R3_ORGANIZER_OVERLAP"
            ? Results.Conflict(body)
            : Results.BadRequest(body);
    }

    public static void MapReservationsEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/reservations");

        // GET /reservations?roomId=1&organizerId=2&status=Booked&from=...&to=...
        group.MapGet("/", async (
            RoomBookingContext db,
            ReservationStatusService statusService,
            int? roomId,
            int? organizerId,
            ReservationStatus? status,
            DateTime? from,
            DateTime? to) =>
        {
            await statusService.CompleteFinishedAsync();

            var query = db.Reservations.AsQueryable();

            if (roomId is not null) query = query.Where(r => r.RoomId == roomId);
            if (organizerId is not null) query = query.Where(r => r.OrganizerId == organizerId);
            if (status is not null) query = query.Where(r => r.Status == status);
            // date range: reservations that overlap the range
            if (from is not null) query = query.Where(r => r.End > from);
            if (to is not null) query = query.Where(r => r.Start < to);

            return await query.OrderBy(r => r.Start).Select(ToDto).ToListAsync();
        });

        // GET /reservations/{id}
        group.MapGet("/{id}", async (int id, RoomBookingContext db, ReservationStatusService statusService) =>
        {
            await statusService.CompleteFinishedAsync();
            
            var reservation = await db.Reservations
                .Where(r => r.Id == id)
                .Select(ToDto)
                .SingleOrDefaultAsync();
            return reservation is null ? Results.NotFound() : Results.Ok(reservation);
        })
        .WithName(GetReservationEndpointName);

        // POST /reservations
        group.MapPost("/", async (
            UpdateReservationDto newReservation,
            RoomBookingContext dbContext,
            ReservationValidator validator) =>
        {
            var error = await validator.ValidateAsync(newReservation, excludeReservationId: null);
            if (error is not null)
                return Results.BadRequest(new { code = error.Code, message = error.Message });

            Reservation reservation = new()
            {
                RoomId = newReservation.RoomId,
                OrganizerId = newReservation.OrganizerId,
                Title = newReservation.Title,
                Start = newReservation.Start,
                End = newReservation.End,
                Attendees = newReservation.Attendees,
                Status = ReservationStatus.Booked
            };
            dbContext.Reservations.Add(reservation);
            await dbContext.SaveChangesAsync();

            var created = await dbContext.Reservations
                .Where(r => r.Id == reservation.Id)
                .Select(r => new ReservationDto(
                    r.Id, r.RoomId, r.Room.Name,
                    r.OrganizerId, r.Organizer.FirstName + " " + r.Organizer.LastName,
                    r.Title, r.Start, r.End, r.Attendees, r.Status))
                .SingleAsync();

            return Results.CreatedAtRoute(GetReservationEndpointName, new {id = reservation.Id}, created);
        
        });

        // POST /reservations/{id}/cancel
        group.MapPost("/{id}/cancel", async (
            int id, 
            RoomBookingContext dbContext, 
            TimeProvider clock) =>
        {
            var reservation = await dbContext.Reservations.FindAsync(id);
            if (reservation is null)
                return Results.NotFound(new { code = "RESERVATION_NOT_FOUND", message = "Reservation not found." });

            var now = clock.GetUtcNow().UtcDateTime;

            if (reservation.Status != ReservationStatus.Booked || reservation.End <= now)
                return Results.Conflict(new { code = "NOT_CANCELLABLE", message = "Only an upcoming or ongoing booked reservation can be cancelled." });

            reservation.Status = ReservationStatus.Cancelled;
            await dbContext.SaveChangesAsync();

            return Results.NoContent();
        });

        // POST /reservations/1/end
        group.MapPost("/{id}/end", async (int id, RoomBookingContext db, TimeProvider clock) =>
        {
            var reservation = await db.Reservations.FindAsync(id);
            if (reservation is null)
                return Results.NotFound(new { code = "RESERVATION_NOT_FOUND", message = "Reservation not found." });

            var now = clock.GetUtcNow().UtcDateTime;

            if (reservation.Status != ReservationStatus.Booked || reservation.Start > now || reservation.End <= now)
                return Results.Conflict(new { code = "NOT_ENDABLE", message = "Only a meeting that is currently in progress can be ended early." });

            reservation.End = now;
            reservation.Status = ReservationStatus.Completed;
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        // PUT /reservations/{id}
        group.MapPut("/{id}", async (
            int id,
            UpdateReservationDto updatedReservation,
            RoomBookingContext db,
            ReservationValidator validator,
            TimeProvider clock) =>
        {
            var reservation = await db.Reservations.FindAsync(id);
            if (reservation is null)
                return Results.NotFound(new { code = "RESERVATION_NOT_FOUND", message = "Reservation not found." });
            
            var now = clock.GetUtcNow().UtcDateTime;
            if (reservation.Status != ReservationStatus.Booked || reservation.Start <= now)
                return Results.Conflict(new
                {
                    code = "NOT_EDITABLE",
                    message = "Only a booked reservation that has not started yet can be edited."
                });

            var error = await validator.ValidateAsync(updatedReservation, excludeReservationId: id);

            if (error is not null)
            {
            var body = new { code = error.Code, message = error.Message };
            return error.Code is "R2_ROOM_OVERLAP" or "R3_ORGANIZER_OVERLAP"
                ? Results.Conflict(body)
                : Results.BadRequest(body);
            }

            reservation.RoomId = updatedReservation.RoomId;
            reservation.OrganizerId = updatedReservation.OrganizerId;
            reservation.Title = updatedReservation.Title;
            reservation.Start = updatedReservation.Start;
            reservation.End = updatedReservation.End;
            reservation.Attendees = updatedReservation.Attendees;

            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
