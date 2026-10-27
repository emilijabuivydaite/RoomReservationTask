# Room Reservation

A web application for booking meeting rooms in an office. Users can browse rooms, book them for meetings and manage their reservations. All business rules and calculations are enforced in the back end; the front end only displays data and error messages.

## Author: Emilija Buivydaitė

## Features

- **Rooms:** list of all rooms with capacity, floor, equipment and active/inactive status. Filter by minimum capacity, floor and equipment.
- **Users:** list of all users with the number of their active reservations.
- **Reservations:** list with room, organizer, title, start and end, attendees and status (Booked, Completed, Cancelled). Filter by room, organizer, status and date range.
- **Actions:** create a reservation, cancel a reservation, end a meeting early.
- **Booking rules (R1-R7)** validated in the back end. A rejected request returns a machine-readable error code and a human-readable message, which the front end displays.
- **Configurable limits** (maximum duration, booking horizon) in `appsettings.json`.

## Tech stack

- **Back end:** ASP.NET (minimal APIs), EF Core in-memory database
- **Front end:** React, TypeScript, Vite, Bootstrap, React Router

No authentication or authorization is implemented, as the task does not require it.

## Project structure

```
RoomBooking/
  RoomBooking.Api/     ASP.NET back end
    Data/              DbContext and seeder
    Dtos/              request and response models
    Endpoints/         rooms, users and reservations endpoints
    Models/            entities and enums
    Services/          reservation status service and config class
    Validation/        ReservationValidator
  roomBooking.React/   React front end
  RoomBooking.slnx
```

## AI Usage

AI tools were used to assist with code optimization, debugging, and troubleshooting during development. The suggested changes were reviewed and tested before being incorporated into the project.

## How to run this project

### Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) (the version targeted by `RoomBooking.Api.csproj`)
- [Node.js](https://nodejs.org/) (current LTS)

### Run the back end

```bash
cd RoomBooking.Api
dotnet run
```

### Run the front end

```bash
cd RoomBooking.React
npm install
npm run dev
```

### Configuration

| Setting | Where | Purpose |
| - | - | - |
| `BookingRules:MaxDurationDays` | `RoomBooking.Api/appsettings.json` | Longest allowed reservation (default 7) |
| `BookingRules:MaxAdvanceDays`  | `RoomBooking.Api/appsettings.json` | How far ahead a reservation can start (default 90) |
| `VITE_API_URL` | `RoomBooking.React/.env.example` | Base URL of the API, e.g. `http://localhost:5298` |
| CORS origin | `RoomBooking.Api/Program.cs` | Must match the front end address (`http://localhost:5173`) |

If the API runs on a different port, update `VITE_API_URL` and restart `npm run dev`.

## API overview

| Method | Endpoint | Description |
| - | - | - |
| GET | `/rooms` | List rooms. Query: `minCapacity`, `floor`, `equipment` (repeatable) |
| GET | `/rooms/{id}` | Get one room |
| GET | `/users` | List users with their active reservation count |
| GET | `/users/{id}` | Get one user |
| GET | `/reservations` | List reservations. Query: `roomId`, `organizerId`, `status`, `from`, `to` |
| GET | `/reservations/{id}` | Get one reservation |
| POST | `/reservations` | Create a reservation (validated) |
| PUT | `/reservations/{id}` | Edit a reservation (validated) |
| POST | `/reservations/{id}/cancel` | Cancel a reservation |
| POST | `/reservations/{id}/end` | End a meeting early |

Errors are returned as:

```json
{
  "code": "R5_CAPACITY",
  "message": "Number of attendees must not exceed the room capacity."
}
```

## Booking rules

Every new reservation is validated in `ReservationValidator`. The first broken rule is returned.

| Rule | Description | Error code |
| - | - | - |
| R1 | A reservation cannot last longer than the maximum duration (exactly 7 days is allowed) | `R1_MAX_DURATION` |
| R2 | A room cannot have two overlapping booked reservations (cancelled ones do not block) | `R2_ROOM_OVERLAP` |
| R3 | An organizer cannot have two overlapping meetings, even in different rooms | `R3_ORGANIZER_OVERLAP` |
| R4 | The start must be in the future | `R4_START_IN_PAST` |
| R5 | Attendees cannot exceed the room capacity | `R5_CAPACITY_EXCEEDED` |
| R6 | A reservation cannot start more than 90 days ahead | `R6_BOOKING_HORIZON` |
| R7 | Inactive rooms cannot be booked | `R7_ROOM_INACTIVE` |

Additional checks: `ROOM_NOT_FOUND`, `ORGANIZER_NOT_FOUND` and `INVALID_TIME_RANGE` (end must be after start).
