import { useEffect, useMemo, useRef, useState } from "react";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";

import { OrbitControls } from "@react-three/drei";

import * as THREE from "three";

import Seat from "./Seat";


// =====================================================
// API
// =====================================================

const API_URL = "http://127.0.0.1:8000";


// =====================================================
// THEATRE CONSTANTS
// =====================================================

const ROWS = [
  "A",
  "B",
  "C",
  "D",
  "E",
];

const SEAT_SPACING = 0.72;
const ROW_SPACING = 1.15;
const AISLE_WIDTH = 1.8;
const SLOPE_ANGLE = 13 * (Math.PI / 180);
const FIRST_ROW_Z = 5;


function getRowHeight(rowIndex) {
  return (
    rowIndex *
    ROW_SPACING *
    Math.tan(SLOPE_ANGLE)
  );
}


// =====================================================
// FLOOR
// =====================================================

function Floor() {
  return (
    <group>

      {/* Main floor */}

      <mesh
        position={[0, -0.15, 7]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[24, 14]} />

        <meshStandardMaterial
          color="#242424"
          roughness={0.9}
        />
      </mesh>


      {/* Front floor */}

      <mesh
        position={[0, 0.15, 1.5]}
      >
        <boxGeometry
          args={[16, 0.3, 2.5]}
        />

        <meshStandardMaterial
          color="#42271d"
          roughness={0.8}
        />
      </mesh>


      {/* Central aisle */}

      <mesh
        position={[0, 0.02, 6]}
      >
        <boxGeometry
          args={[
            AISLE_WIDTH,
            0.06,
            9,
          ]}
        />

        <meshStandardMaterial
          color="#4a2929"
          roughness={0.9}
        />
      </mesh>


      {/* Aisle steps */}

      {[5.2, 6.35, 7.5, 8.65, 9.8].map(
        (z, index) => (
          <mesh
            key={index}
            position={[
              0,
              getRowHeight(index) + 0.04,
              z,
            ]}
          >
            <boxGeometry
              args={[
                AISLE_WIDTH,
                0.08,
                0.12,
              ]}
            />

            <meshStandardMaterial
              color="#a17b59"
              roughness={0.7}
            />
          </mesh>
        )
      )}

    </group>
  );
}


// =====================================================
// SEATING FLOOR
// =====================================================

function SeatingFloor() {
  return (
    <group>

      {ROWS.map((row, index) => {

        const y = getRowHeight(index);

        const z =
          FIRST_ROW_Z +
          index * ROW_SPACING;

        return (
          <mesh
            key={row}
            position={[
              0,
              y - 0.12,
              z,
            ]}
          >

            <boxGeometry
              args={[
                15,
                0.22,
                ROW_SPACING,
              ]}
            />

            <meshStandardMaterial
              color="#292929"
              roughness={0.95}
            />

          </mesh>
        );
      })}

    </group>
  );
}


// =====================================================
// SCREEN BACKDROP
// =====================================================

function ScreenBackdrop() {
  return (
    <group>

      {/* Black wall behind screen */}

      <mesh
        position={[
          0,
          3.5,
          0.65,
        ]}
      >

        <boxGeometry
          args={[
            15,
            7.2,
            0.25,
          ]}
        />

        <meshStandardMaterial
          color="#080808"
          roughness={0.95}
        />

      </mesh>


      {/* Lower screen wall */}

      <mesh
        position={[
          0,
          0.35,
          0.4,
        ]}
      >

        <boxGeometry
          args={[
            15,
            0.7,
            0.3,
          ]}
        />

        <meshStandardMaterial
          color="#252525"
          roughness={0.95}
        />

      </mesh>

    </group>
  );
}


// =====================================================
// VIDEO SCREEN
// =====================================================

function VideoScreen({ video, isPlaying }) {
  const videoTexture = useMemo(() => {
    if (!video) {
      console.log("VideoScreen: no video");
      return null;
    }

    console.log("VideoScreen: creating VideoTexture");

    const texture = new THREE.VideoTexture(video);

    texture.colorSpace = THREE.SRGBColorSpace;

    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    texture.generateMipmaps = false;

    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    texture.flipY = true;

    console.log("Video texture created:", texture);

    return texture;
  }, [video]);

  const welcomeTexture = useMemo(() => {
  if (isPlaying) {
    return null;
  }

  const canvas = document.createElement("canvas");

  canvas.width = 1200;
  canvas.height = 675;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#111111";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "bold 72px Arial";
  ctx.fillText(
    "GOVIND CINEMAS",
    canvas.width / 2,
    canvas.height / 2 - 45
  );

  ctx.font = "32px Arial";
  ctx.fillStyle = "#bbbbbb";
  ctx.fillText(
    "Welcome to your cinematic experience",
    canvas.width / 2,
    canvas.height / 2 + 45
  );

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}, [isPlaying]);

  useFrame(() => {
    if (
      videoTexture &&
      video &&
      video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      videoTexture.needsUpdate = true;
    }
  });

  const width = 12;
  const height = width / (848 / 478);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      width,
      height,
      80,
      1
    );

    const position = geo.attributes.position;

    const curve = 0.28;

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);

      const normalized = x / (width / 2);

      const z =
        curve * (1 - normalized * normalized);

      position.setZ(i, z);
    }

    position.needsUpdate = true;

    geo.computeVertexNormals();

    return geo;
  }, []);

  if (!videoTexture) {
    return null;
  }

  return (
    <mesh
      geometry={geometry}
      position={[
        0,
        0.8 + height / 2,
        0.85
      ]}
    >
      <meshBasicMaterial
        map={isPlaying ? videoTexture : welcomeTexture}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

// =====================================================
// SCREEN FRAME
// =====================================================

function ScreenFrame() {

  const width = 12;

  const height =
    width / (848 / 478);

  const bottom = 0.8;

  const top =
    bottom + height;

  const centerY =
    bottom + height / 2;


  return (

    <group>

      {/* Top */}

      <mesh
        position={[
          0,
          top + 0.12,
          0.12,
        ]}
      >

        <boxGeometry
          args={[
            width + 0.45,
            0.22,
            0.25,
          ]}
        />

        <meshStandardMaterial
          color="#111111"
        />

      </mesh>


      {/* Bottom */}

      <mesh
        position={[
          0,
          bottom - 0.12,
          0.12,
        ]}
      >

        <boxGeometry
          args={[
            width + 0.45,
            0.22,
            0.25,
          ]}
        />

        <meshStandardMaterial
          color="#111111"
        />

      </mesh>


      {/* Left */}

      <mesh
        position={[
          -(width / 2) - 0.12,
          centerY,
          0.12,
        ]}
      >

        <boxGeometry
          args={[
            0.22,
            height + 0.25,
            0.25,
          ]}
        />

        <meshStandardMaterial
          color="#111111"
        />

      </mesh>


      {/* Right */}

      <mesh
        position={[
          width / 2 + 0.12,
          centerY,
          0.12,
        ]}
      >

        <boxGeometry
          args={[
            0.22,
            height + 0.25,
            0.25,
          ]}
        />

        <meshStandardMaterial
          color="#111111"
        />

      </mesh>

    </group>
  );
}


// =====================================================
// SIDE WALLS
// =====================================================

function SideWalls() {

  return (

    <group>

      {/* Left main wall */}

      <mesh
        position={[
          -9,
          3.5,
          5.5,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
      >

        <boxGeometry
          args={[
            12,
            7,
            0.3,
          ]}
        />

        <meshStandardMaterial
          color="#151515"
          roughness={0.9}
        />

      </mesh>


      {/* Right main wall */}

      <mesh
        position={[
          9,
          3.5,
          5.5,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
      >

        <boxGeometry
          args={[
            12,
            7,
            0.3,
          ]}
        />

        <meshStandardMaterial
          color="#151515"
          roughness={0.9}
        />

      </mesh>


      {/* Left red panel */}

      <mesh
        position={[
          -8.75,
          3.3,
          5.5,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
      >

        <boxGeometry
          args={[
            10,
            3.5,
            0.04,
          ]}
        />

        <meshStandardMaterial
          color="#3b1717"
          roughness={0.8}
        />

      </mesh>


      {/* Right red panel */}

      <mesh
        position={[
          8.75,
          3.3,
          5.5,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
      >

        <boxGeometry
          args={[
            10,
            3.5,
            0.04,
          ]}
        />

        <meshStandardMaterial
          color="#3b1717"
          roughness={0.8}
        />

      </mesh>

    </group>
  );
}


// =====================================================
// CEILING
// =====================================================

function Ceiling() {

  return (

    <mesh
      position={[
        0,
        8,
        5,
      ]}
      rotation={[
        Math.PI / 2,
        0,
        0,
      ]}
    >

      <planeGeometry
        args={[
          24,
          16,
        ]}
      />

      <meshStandardMaterial
        color="#0d0d0d"
        side={THREE.DoubleSide}
        roughness={1}
      />

    </mesh>
  );
}


// =====================================================
// CEILING LIGHT
// =====================================================

function CeilingLight({ position }) {

  return (

    <group position={position}>

      <mesh>

        <cylinderGeometry
          args={[
            0.12,
            0.12,
            0.05,
            16,
          ]}
        />

        <meshStandardMaterial
          color="#eeeecc"
          emissive="#ffffff"
          emissiveIntensity={2}
        />

      </mesh>


      <pointLight
        intensity={0.35}
        distance={5}
      />

    </group>
  );
}


// =====================================================
// SPEAKER
// =====================================================

function Speaker({ position }) {

  return (

    <group position={position}>

      <mesh>

        <boxGeometry
          args={[
            0.45,
            0.8,
            0.18,
          ]}
        />

        <meshStandardMaterial
          color="#fff9f9"
        />

      </mesh>


      <mesh
        position={[
          0,
          0,
          -0.1,
        ]}
      >

        <circleGeometry
          args={[
            0.13,
            16,
          ]}
        />

        <meshStandardMaterial
          color="#222222"
        />

      </mesh>

    </group>
  );
}


// =====================================================
// SEAT CAMERA
// =====================================================

function SeatCamera({
  selectedSeat,
  controlsRef,
}) {

  const { camera } =
    useThree();


  const targetPosition =
    useRef(
      new THREE.Vector3()
    );


  const targetLookAt =
    useRef(
      new THREE.Vector3()
    );


  useFrame(
    (state, delta) => {

      if (!selectedSeat) {
        return;
      }


      targetPosition.current.set(
        selectedSeat.position[0],
        selectedSeat.position[1] + 1.25,
        selectedSeat.position[2] + 0.15
      );


      targetLookAt.current.set(
        0,
        4,
        0
      );


      const smooth =
        1 -
        Math.exp(
          -5 * delta
        );


      camera.position.lerp(
        targetPosition.current,
        smooth
      );


      camera.lookAt(
        targetLookAt.current
      );


      if (controlsRef.current) {

        controlsRef.current.target.lerp(
          targetLookAt.current,
          smooth
        );

        controlsRef.current.update();

      }

    }
  );


  return null;
}


// =====================================================
// SEATING ROWS
// =====================================================

function SeatingRows({
  selectedSeat,
  onSeatSelect,
  availableSeats,
  bookedSeats,
}) {

  const seats = [];


  ROWS.forEach(
    (row, rowIndex) => {

      const z =
        FIRST_ROW_Z +
        rowIndex * ROW_SPACING;


      const y =
        getRowHeight(rowIndex);


      // LEFT SIDE - 9 SEATS

      for (
        let i = 0;
        i < 9;
        i++
      ) {

        const x =
          -AISLE_WIDTH / 2
          - 0.3
          - (8 - i) *
          SEAT_SPACING;


        seats.push({

          id:
            `${row}${i + 1}`,

          row,

          number:
            i + 1,

          position: [
            x,
            y,
            z,
          ],

        });

      }


      // RIGHT SIDE - 9 SEATS

      for (
        let i = 0;
        i < 9;
        i++
      ) {

        const x =
          AISLE_WIDTH / 2
          + 0.3
          + i * SEAT_SPACING;


        seats.push({

          id:
            `${row}${i + 10}`,

          row,

          number:
            i + 10,

          position: [
            x,
            y,
            z,
          ],

        });

      }

    }
  );


  return (

    <group>

      {seats.map(
        (seat) => {

          const isBooked =
            bookedSeats.includes(
              seat.id
            );


          const isAvailable =
            availableSeats.includes(
              seat.id
            );


          const isSelected =
            selectedSeat?.id ===
            seat.id;


          let status =
            "booked";


          if (isAvailable) {

            status =
              "available";

          }


          if (isBooked) {

            status =
              "booked";

          }


          if (isSelected) {

            status =
              "selected";

          }


          return (

            <Seat

              key={
                seat.id
              }

              position={
                seat.position
              }

              status={
                status
              }

              onClick={() => {

                if (
                  status ===
                  "available"
                ) {

                  onSeatSelect(
                    seat
                  );

                }

              }}

            />

          );

        }
      )}

    </group>
  );
}


// =====================================================
// MAIN APP
// =====================================================

function App() {

  // ===================================================
  // SEAT SELECTION
  // ===================================================

  const [
    selectedSeat,
    setSelectedSeat,
  ] = useState(null);


  // ===================================================
  // VIDEO
  // ===================================================

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false);


  const [
    videoReady,
    setVideoReady,
  ] = useState(false);


  const [
    videoElement,
    setVideoElement,
  ] = useState(null);


  // ===================================================
  // API STATE
  // ===================================================

  const [
    movies,
    setMovies,
  ] = useState([]);


  const [
    selectedMovie,
    setSelectedMovie,
  ] = useState("BKU");


  const [
    shows,
    setShows,
  ] = useState([]);


  const [
    selectedShow,
    setSelectedShow,
  ] = useState("");


  const [
    availableSeats,
    setAvailableSeats,
  ] = useState([]);


  const [
    bookedSeats,
    setBookedSeats,
  ] = useState([]);


  const [
    loadingSeats,
    setLoadingSeats,
  ] = useState(false);


  const [
    booking,
    setBooking,
  ] = useState(false);


  const [
    bookingMessage,
    setBookingMessage,
  ] = useState("");

  const [
  bookingDetails,
  setBookingDetails,
] = useState(null);


  // ===================================================
  // CONTROLS
  // ===================================================

  const controlsRef =
    useRef(null);


  // ===================================================
  // GET MOVIES
  // ===================================================

  useEffect(() => {

    fetch(
      `${API_URL}/movies`
    )

      .then(
        (response) => {

          if (!response.ok) {
            throw new Error(
              "Failed to load movies"
            );
          }

          return response.json();

        }
      )

      .then(
        (data) => {

          console.log(
            "MOVIES FROM API:",
            data
          );

          setMovies(data);

        }
      )

      .catch(
        (error) => {

          console.error(
            "MOVIES API ERROR:",
            error
          );

        }
      );

  }, []);


  // ===================================================
  // GET SHOWS WHEN MOVIE CHANGES
  // ===================================================

  useEffect(() => {

    if (!selectedMovie) {
      return;
    }


    setSelectedShow("");

    setShows([]);


    fetch(
      `${API_URL}/movies/${selectedMovie}/shows`
    )

      .then(
        (response) => {

          if (!response.ok) {
            throw new Error(
              "Failed to load shows"
            );
          }

          return response.json();

        }
      )

      .then(
        (data) => {

          console.log(
            "SHOWS FROM API:",
            data
          );

          setShows(data);

          if (data.length > 0) {

            setSelectedShow(
              data[0]
            );

          }

        }
      )

      .catch(
        (error) => {

          console.error(
            "SHOWS API ERROR:",
            error
          );

        }
      );

  }, [selectedMovie]);


  // ===================================================
  // GET SEATS
  // ===================================================

  useEffect(() => {

    if (
      !selectedMovie ||
      !selectedShow
    ) {

      return;

    }


    setLoadingSeats(true);

    setSelectedSeat(null);

    setBookingMessage("");


    fetch(
      `${API_URL}/seats/${selectedMovie}/${selectedShow}`
    )

      .then(
        (response) => {

          if (!response.ok) {
            throw new Error(
              "Failed to load seats"
            );
          }

          return response.json();

        }
      )

      .then(
        (data) => {

          console.log(
            "SEATS FROM API:",
            data
          );


          setAvailableSeats(
            data.available || []
          );


          setBookedSeats(
            data.booked || []
          );

        }
      )

      .catch(
        (error) => {

          console.error(
            "SEATS API ERROR:",
            error
          );

          setAvailableSeats([]);

          setBookedSeats([]);

        }
      )

      .finally(() => {

        setLoadingSeats(false);

      });

  }, [
    selectedMovie,
    selectedShow,
  ]);


  // ===================================================
  // VIDEO SETUP
  // ===================================================

  useEffect(() => {

    const video =
      document.createElement(
        "video"
      );


    video.src =
      "/theatre_vdo.mp4";


    video.muted =
      true;


    video.loop =
      true;


    video.playsInline =
      true;


    video.preload =
      "auto";


    video.crossOrigin =
      "anonymous";


    const handleReady =
      () => {

        console.log(
          "VIDEO READY"
        );

        setVideoReady(
          true
        );

      };


    const handlePlay =
      () => {

        console.log(
          "VIDEO PLAYING"
        );

        setIsPlaying(
          true
        );

      };


    const handlePause =
      () => {

        setIsPlaying(
          false
        );

      };


    const handleError =
      (event) => {

        console.error(
          "VIDEO ERROR:",
          event
        );

      };


    video.addEventListener(
      "loadeddata",
      handleReady
    );


    video.addEventListener(
      "canplay",
      handleReady
    );


    video.addEventListener(
      "play",
      handlePlay
    );


    video.addEventListener(
      "pause",
      handlePause
    );


    video.addEventListener(
      "error",
      handleError
    );


    setVideoElement(
      video
    );


    video.load();


    return () => {

      video.pause();


      video.removeEventListener(
        "loadeddata",
        handleReady
      );


      video.removeEventListener(
        "canplay",
        handleReady
      );


      video.removeEventListener(
        "play",
        handlePlay
      );


      video.removeEventListener(
        "pause",
        handlePause
      );


      video.removeEventListener(
        "error",
        handleError
      );


      video.src =
        "";


      video.load();


      setVideoElement(
        null
      );

    };

  }, []);


  // ===================================================
  // PLAY MOVIE
  // ===================================================

  const playMovie =
    async () => {

      if (!videoElement) {

        console.error(
          "Video element is not ready"
        );

        return;

      }


      try {

        await videoElement.play();


        console.log(
          "MOVIE PLAYING"
        );


        setIsPlaying(
          true
        );

      }

      catch (error) {

        console.error(
          "PLAY ERROR:",
          error
        );

      }

    };


  // ===================================================
  // PAUSE MOVIE
  // ===================================================

  const pauseMovie =
    () => {

      if (!videoElement) {
        return;
      }


      videoElement.pause();


      setIsPlaying(
        false
      );

    };


  // ===================================================
  // TOGGLE MOVIE
  // ===================================================

  const toggleMovie =
    () => {

      if (isPlaying) {

        pauseMovie();

      }

      else {

        playMovie();

      }

    };


  // ===================================================
  // BOOK SELECTED SEAT
  // ===================================================

  const confirmBooking =
    async () => {

      if (
        !selectedSeat ||
        !selectedMovie ||
        !selectedShow
      ) {

        return;

      }


      setBooking(true);

      setBookingMessage("");


      try {

        const response =
          await fetch(
            `${API_URL}/book`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  movie:
                    selectedMovie,

                  show:
                    selectedShow,

                  seats: [
                    selectedSeat.id
                  ],
                }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Booking failed"
          );

        }


        console.log(
          "BOOKING RESPONSE:",
          data
        );


        setBookingMessage(
          `Seat ${selectedSeat.id} booked successfully!`
        );

        
        setBookingDetails({
          theatre: "Govind Cinemas",
          movie: selectedMovie,
          show: selectedShow,
          seats: [selectedSeat.id],
          tickets: 1,
        });


        // Refresh seat status

        const seatsResponse =
          await fetch(
            `${API_URL}/seats/${selectedMovie}/${selectedShow}`
          );


        const seatsData =
          await seatsResponse.json();


        setAvailableSeats(
          seatsData.available || []
        );


        setBookedSeats(
          seatsData.booked || []
        );


        setSelectedSeat(
          null
        );

      }

      catch (error) {

        console.error(
          "BOOKING ERROR:",
          error
        );


        setBookingMessage(
          error.message
        );

      }

      finally {

        setBooking(false);

      }

    };


  // ===================================================
  // UI
  // ===================================================

  return (

    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#3e3e3e",
      }}
    >

      {/* ==========================================
          SEAT LEGEND
      ========================================== */}

      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 20,
          background:
            "rgba(4, 4, 4, 0.88)",
          padding:
            "15px 20px",
          borderRadius:
            "10px",
          color:
            "white",
          fontFamily:
            "Arial",
          fontSize:
            "14px",
        }}
      >

        <div
          style={{
            fontWeight:
              "bold",
            marginBottom:
              "10px",
          }}
        >
          Seat Status
        </div>


        <div>
          🟢 Available
        </div>


        <div>
          🔴 Booked
        </div>


        <div>
          🔵 Selected
        </div>

      </div>


      {/* ==========================================
          MOVIE / SHOW SELECTION
      ========================================== */}

      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 40,
          background:
            "rgba(0,0,0,0.92)",
          color: "white",
          padding: "16px",
          borderRadius: "10px",
          width: "220px",
          fontFamily: "Arial",
        }}
      >

        <div
          style={{
            fontWeight: "bold",
            marginBottom: "8px",
            fontSize: "16px",
          }}
        >
          🎬 Movie
        </div>


        <select
          value={selectedMovie}
          onChange={(event) => {

            setSelectedMovie(
              event.target.value
            );

          }}
          style={{
            width: "100%",
            padding: "9px",
            borderRadius: "6px",
            border: "none",
            marginBottom: "14px",
          }}
        >

          {movies.map(
            (movie) => (

              <option
                key={movie}
                value={movie}
              >
                {movie}
              </option>

            )
          )}

        </select>


        <div
          style={{
            fontWeight: "bold",
            marginBottom: "8px",
            fontSize: "16px",
          }}
        >
          🕐 Show Time
        </div>


        <select
          value={selectedShow}
          onChange={(event) => {

            setSelectedShow(
              event.target.value
            );

          }}
          style={{
            width: "100%",
            padding: "9px",
            borderRadius: "6px",
            border: "none",
          }}
        >

          {shows.map(
            (show) => (

              <option
                key={show}
                value={show}
              >
                {show}
              </option>

            )
          )}

        </select>


        {loadingSeats && (

          <div
            style={{
              marginTop: "10px",
              fontSize: "12px",
              color: "#aaa",
            }}
          >
            Loading seats...
          </div>

        )}

      </div>


      {/* ==========================================
          API INFORMATION
      ========================================== */}

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 20,
          background:
            "rgba(0,0,0,0.75)",
          color: "white",
          padding:
            "10px 14px",
          borderRadius:
            "8px",
          fontFamily:
            "Arial",
          fontSize:
            "12px",
        }}
      >

        <div>
          Movie: {selectedMovie}
        </div>

        <div>
          Show: {selectedShow}
        </div>

        <div>
          Available:{" "}
          {availableSeats.length}
        </div>

        <div>
          Booked:{" "}
          {bookedSeats.length}
        </div>

      </div>


      {/* ==========================================
          MOVIE CONTROL
      ========================================== */}

      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform:
            "translateX(-50%)",
          zIndex: 30,
        }}
      >

        <button
          onClick={toggleMovie}
          disabled={!videoReady}
          style={{
            border: "none",
            borderRadius:
              "10px",
            padding:
              "12px 22px",
            background:
              videoReady
                ? "#ffffff"
                : "#555555",
            color:
              videoReady
                ? "#111111"
                : "#cccccc",
            fontSize:
              "15px",
            fontWeight:
              "bold",
            cursor:
              videoReady
                ? "pointer"
                : "not-allowed",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.35)",
          }}
        >

          {!videoReady
            ? "Loading Movie..."
            : isPlaying
              ? "⏸ Pause Movie"
              : "▶ Play Movie"}

        </button>

      </div>


      {/* ==========================================
          VIDEO STATUS
      ========================================== */}

      <div
        style={{
          position:
            "absolute",
          bottom:
            "20px",
          left:
            "20px",
          zIndex:
            20,
          background:
            "rgba(0,0,0,0.75)",
          color:
            "white",
          padding:
            "8px 12px",
          borderRadius:
            "8px",
          fontFamily:
            "Arial",
          fontSize:
            "12px",
        }}
      >

        {videoReady

          ? isPlaying
            ? "🎬 Movie playing"
            : "🎬 Movie ready"

          : "Loading movie..."}

      </div>


      {/* ==========================================
          SELECTED SEAT INFORMATION
      ========================================== */}

      {selectedSeat && (

        <div
          style={{
            position:
              "absolute",
            top:
              "150px",
            right:
              "20px",
            zIndex:
              20,
            background:
              "rgba(0,0,0,0.92)",
            color:
              "white",
            padding:
              "20px",
            borderRadius:
              "10px",
            fontFamily:
              "Arial",
            minWidth:
              "180px",
          }}
        >

          <div
            style={{
              fontSize:
                "20px",
              fontWeight:
                "bold",
              marginBottom:
                "8px",
            }}
          >

            Seat{" "}
            {selectedSeat.id}

          </div>


          <div>
            Movie:{" "}
            {selectedMovie}
          </div>


          <div>
            Show:{" "}
            {selectedShow}
          </div>


          <div>
            Row:{" "}
            {selectedSeat.row}
          </div>


          <div>
            Seat:{" "}
            {selectedSeat.number}
          </div>


          <div
            style={{
              marginTop:
                "10px",
              fontSize:
                "13px",
              opacity:
                0.7,
            }}
          >
            Camera moved to seat POV
          </div>


          <button
            onClick={confirmBooking}
            disabled={booking}
            style={{
              width: "100%",
              marginTop: "15px",
              padding: "10px",
              border: "none",
              borderRadius: "7px",
              background:
                booking
                  ? "#555"
                  : "#2196f3",
              color: "white",
              fontWeight: "bold",
              cursor:
                booking
                  ? "not-allowed"
                  : "pointer",
            }}
          >

            {booking
              ? "Booking..."
              : "Confirm Booking"}

          </button>

        </div>

      )}


      {/* ==========================================
          BOOKING MESSAGE
      ========================================== */}

      {bookingMessage && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        width: "360px",
        padding: "30px",
        background: "#111",
        borderRadius: "16px",
        border: "1px solid #333",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        color: "white",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "42px",
          marginBottom: "10px",
        }}
      >
        ✓
      </div>

      <h2
        style={{
          margin: "0 0 8px 0",
          color: "#4caf50",
        }}
      >
        BOOKING CONFIRMED
      </h2>

      <div
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          marginBottom: "25px",
        }}
      >
        {bookingDetails.theatre}
      </div>

      <div
        style={{
          textAlign: "left",
          lineHeight: "2",
          fontSize: "15px",
        }}
      >
        <div>
          <strong>Movie:</strong>{" "}
          {bookingDetails.movie}
        </div>

        <div>
          <strong>Show:</strong>{" "}
          {bookingDetails.show}
        </div>

        <div>
          <strong>Seats:</strong>{" "}
          {bookingDetails.seats.join(", ")}
        </div>

        <div>
          <strong>Tickets:</strong>{" "}
          {bookingDetails.tickets}
        </div>
      </div>

      <button
        onClick={() => setBookingDetails(null)}
        style={{
          width: "100%",
          marginTop: "25px",
          padding: "12px",
          border: "none",
          borderRadius: "8px",
          background: "#2196f3",
          color: "white",
          fontSize: "15px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        DONE
      </button>
    </div>
  </div>
)}

        <div
          style={{
            position:
              "absolute",
            top:
              "330px",
            right:
              "20px",
            zIndex:
              30,
            background:
              bookingMessage.includes(
                "successfully"
              )
                ? "#176b36"
                : "#8b2020",
            color:
              "white",
            padding:
              "12px 16px",
            borderRadius:
              "8px",
            fontFamily:
              "Arial",
            fontSize:
              "13px",
            maxWidth:
              "220px",
          }}
        >

          {bookingMessage}

        </div>



      {/* ==========================================
          3D CINEMA
      ========================================== */}

      <Canvas
        camera={{
          position: [
            0,
            5,
            15,
          ],
          fov:
            60,
          near:
            0.1,
          far:
            100,
        }}
      >

        {/* ========================================
            LIGHTING
        ======================================== */}

        <ambientLight
          intensity={1.2}
        />


        <directionalLight
          position={[
            0,
            8,
            2,
          ]}
          intensity={1.6}
        />


        {/* ========================================
            THEATRE FLOOR
        ======================================== */}

        <Floor />


        <SeatingFloor />


        {/* ========================================
            SCREEN
        ======================================== */}

        <ScreenBackdrop />


        <VideoScreen
          video={
            videoElement
          }
          isPlaying={isPlaying}
        />


        <ScreenFrame />


        {/* ========================================
            SIDE WALLS
        ======================================== */}

        <SideWalls />


        {/* ========================================
            CEILING
        ======================================== */}

        <Ceiling />


        {/* ========================================
            CEILING LIGHTS
        ======================================== */}

        <CeilingLight
          position={[
            -4,
            7.8,
            3,
          ]}
        />


        <CeilingLight
          position={[
            0,
            7.8,
            3,
          ]}
        />


        <CeilingLight
          position={[
            4,
            7.8,
            3,
          ]}
        />


        <CeilingLight
          position={[
            -4,
            7.8,
            7,
          ]}
        />


        <CeilingLight
          position={[
            0,
            7.8,
            7,
          ]}
        />


        <CeilingLight
          position={[
            4,
            7.8,
            7,
          ]}
        />


        {/* ========================================
            SPEAKERS
        ======================================== */}

        <Speaker
          position={[
            -6.5,
            2.2,
            0.3,
          ]}
        />


        <Speaker
          position={[
            6.5,
            2.2,
            0.3,
          ]}
        />


        {/* ========================================
            SEATS
        ======================================== */}

        <SeatingRows
          selectedSeat={
            selectedSeat
          }

          availableSeats={
            availableSeats
          }

          bookedSeats={
            bookedSeats
          }

          onSeatSelect={
            setSelectedSeat
          }
        />


        {/* ========================================
            SEAT POV CAMERA
        ======================================== */}

        <SeatCamera
          selectedSeat={
            selectedSeat
          }

          controlsRef={
            controlsRef
          }
        />


        {/* ========================================
            ORBIT CONTROLS
        ======================================== */}

        <OrbitControls
          ref={
            controlsRef
          }

          enableDamping

          dampingFactor={
            0.08
          }

          target={[
            0,
            3.5,
            3,
          ]}
        />

      </Canvas>

    </div>
  );
}


export default App;