using System.Security.Cryptography.X509Certificates;
using RoomBooking.Api.Models;

namespace RoomBooking.Api.Dtos;

public record ReservationDto(
    int Id,
    int RoomId,
    string RoomName,
    int OrganizerId,
    string OrganizerName,
    string Title,
    DateTime Start,
    DateTime End,
    int Attendees,
    ReservationStatus Status
);