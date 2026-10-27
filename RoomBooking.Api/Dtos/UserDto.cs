using RoomBooking.Api.Models;

namespace RoomBooking.Api.Dtos;

public record UserDto(
    int Id,
    string FirstName,
    string LastName,
    int ActiveReservations
);