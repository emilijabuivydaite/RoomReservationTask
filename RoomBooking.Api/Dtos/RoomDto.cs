using RoomBooking.Api.Models;

namespace RoomBooking.Api.Dtos;

public record RoomDto(
    int Id,
    string Name,
    int Capacity,
    int Floor,
    List<string> Equipment,
    bool IsActive
);