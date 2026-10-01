from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
import os

app = FastAPI()

class BookingRequest(BaseModel):
    movie: str
    show: str
    seats: list[str]


@app.get("/movies")
def get_movies():
    return ["BKU", "DC", "TOXIC", "KHALIFA"]


@app.get("/movies/{movie}/shows")
def get_shows(movie: str):

    movies = ["BKU", "DC", "TOXIC", "KHALIFA"]

    if movie not in movies:
        return {"error": "Movie not found"}

    return ["11:00", "01:30", "04:00", "07:00", "09:30"]


@app.get("/seats/{movie}/{show}")
def get_seats(movie: str, show: str):

    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Theatre.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT seat, status FROM seats WHERE movie = ? AND show = ?",
        (movie, show)
    )

    seats = cursor.fetchall()

    conn.close()

    available = []
    booked = []

    for seat, status in seats:
        if status == "available":
            available.append(seat)

        elif status == "booked":
            booked.append(seat)

    return {
        "movie": movie,
        "show": show,
        "available": available,
        "booked": booked
    }

@app.post("/book")
def book_seats(booking: BookingRequest):

    db_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "Theatre.db"
    )

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Check every selected seat first
    for seat in booking.seats:

        cursor.execute(
            """
            SELECT status
            FROM seats
            WHERE movie = ? AND show = ? AND seat = ?
            """,
            (booking.movie, booking.show, seat)
        )

        result = cursor.fetchone()

        if result is None:
            conn.close()
            raise HTTPException(
                status_code=404,
                detail=f"Seat {seat} does not exist"
            )

        if result[0] == "booked":
            conn.close()
            raise HTTPException(
                status_code=409,
                detail=f"Seat {seat} is already booked"
            )

    # Book the seats
    for seat in booking.seats:

        cursor.execute(
            """
            UPDATE seats
            SET status = ?
            WHERE movie = ? AND show = ? AND seat = ?
            """,
            ("booked", booking.movie, booking.show, seat)
        )

    conn.commit()
    conn.close()

    return {
        "message": "Booking successful",
        "movie": booking.movie,
        "show": booking.show,
        "seats": booking.seats
    }