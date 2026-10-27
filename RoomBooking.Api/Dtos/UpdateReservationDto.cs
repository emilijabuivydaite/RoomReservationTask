using System.ComponentModel.DataAnnotations;

namespace RoomBooking.Api.Dtos;

public record UpdateReservationDto(
    [Range(1, int.MaxValue)] int RoomId,
    [Range(1, int.MaxValue)] int OrganizerId,
    [Required][StringLength(50)] string Title,
    DateTime Start,
    DateTime End,
    [Range(1, 100)] int Attendees
);