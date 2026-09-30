import random
import sqlite3

class Theatre:
    def __init__(self,Movies,Shows):
        self.conn=sqlite3.connect("Theatre.db")
        self.cursor=self.conn.cursor()
        self.cursor.execute("""CREATE TABLE IF NOT EXISTS seats(movie TEXT,show TEXT,seat TEXT,status TEXT)""")
        self.conn.commit()
        self.name="Govind Cinemas"
        self.num_of_screen=4
        self.num_of_movies=Movies
        self.num_of_shows=Shows
        self.all_seats = [
        "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18",
        "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "B13", "B14", "B15", "B16", "B17", "B18",
        "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12", "C13", "C14", "C15", "C16", "C17", "C18",
        "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13", "D14", "D15", "D16", "D17", "D18",
        "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18"]

        self.movies = ["BKU", "DC", "TOXIC", "KHALIFA"]
        self.shows = ["11:00", "01:30", "04:00", "07:00", "09:30"]
        self.available_seats = {}
        self.booked_seats = {}

        for movie in self.movies:
            self.available_seats[movie] = {}
            self.booked_seats[movie] = {}

            for show in self.shows:
                self.available_seats[movie][show] = random.sample(self.all_seats, 15)
                self.booked_seats[movie][show] = []
                
                for seat in self.available_seats[movie][show]:
                    self.cursor.execute("INSERT INTO seats (movie, show, seat, status) VALUES (?, ?, ?, ?)",
                (movie, show, seat, "available"))

        self.conn.commit()


        print("______________________Welcome To Govind Theatres____________________________ ")
        print("\n")

    def bookings(self):   
        moviess=int(input("1.BKU""\n2.DC""\n3.TOXIC""\n4.KHALIFA""\nEnter Movie Choice :"))

        if moviess==1:
            Movie="BKU"
        elif moviess==2:
            Movie="DC"
        elif moviess==3:
            Movie="TOXIC"
        elif moviess==4:
            Movie="KHALIFA"
        else:
            print("Invalid Choice")
            return    

        print("Shows")       
        ch=int(input("\n1.11.00""\n2.01.30""\n3.04.00""\n4.07.00""\n5.09.30""\nEnter The Show Choice :"))

        if ch==1:
            show="11:00"
        elif ch==2:
            show="01:30"
        elif ch==3:
            show="04:00"
        elif ch==4:
            show="07:00"
        elif ch==5:
            show="09:30"
        else:
            print("Invalid choice")
            return

        available_seats = self.available_seats[Movie][show]

        print("\nAvailable Seats:")
        print(available_seats)

        ticket=int(input("Enter the number of tickets you need : "))
        if ticket > len(available_seats):
            print("Not Enough seats available")
            return

        selected_seats = []

        for i in range(ticket):
            while True:
                seat = input(f"Select Seat {i + 1}: ")

                if seat in selected_seats:
                    print("Seat Already Selected")
                    continue    

                if seat in available_seats:
                    selected_seats.append(seat)
                    break
                else:
                    print("Seat is not available")
                    continue
        for seat in selected_seats:
            self.booked_seats[Movie][show].append(seat)
            available_seats.remove(seat)


        print("\nSelected Seats:", selected_seats)
        print("\n")    
        print("_________________Booking Details______________________")
        print("\n")
        print("Number Of Tickets :",ticket)
        print("Movie Name : ",Movie)
        print("Show Time : ",show)
        print(f"Your Booking For {Movie} Is Successfull!!!")
        print("Enjoy Your Movie Experience Have a Nice Day!!") 
        print("Cancellation Not Available")


cls=Theatre(4,20)
cls.bookings()
