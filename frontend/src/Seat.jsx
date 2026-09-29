function Seat({
  position = [0, 0, 0],
  status = "available",
  onClick,
}) {

  // Seat colors based on state
  const seatColor =
    status === "booked"
      ? "#e53935"       // Red
      : status === "selected"
      ? "#2196f3"       // Blue
      : "#22c55e";      // Green


  return (
    <group
      position={position}
      onClick={(event) => {
        event.stopPropagation();

        // Booked seats cannot be selected
        if (status !== "booked") {
          onClick();
        }
      }}

      onPointerOver={(event) => {
        event.stopPropagation();

        if (status !== "booked") {
          document.body.style.cursor = "pointer";
        }
      }}

      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >

      {/* =========================
          SEAT CUSHION
      ========================= */}

      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.6]} />

        <meshStandardMaterial
          color={seatColor}
          roughness={0.7}
        />
      </mesh>


      {/* =========================
          BACKREST
      ========================= */}

      <mesh position={[0, 0.9, 0.18]}>
        <boxGeometry args={[0.6, 0.8, 0.2]} />

        <meshStandardMaterial
          color={seatColor}
          roughness={0.7}
        />
      </mesh>


      {/* =========================
          LEFT ARMREST
      ========================= */}

      <mesh position={[-0.38, 0.6, 0]}>
        <boxGeometry args={[0.12, 0.3, 0.7]} />

        <meshStandardMaterial
          color="#151515"
        />
      </mesh>


      {/* =========================
          RIGHT ARMREST
      ========================= */}

      <mesh position={[0.38, 0.6, 0]}>
        <boxGeometry args={[0.12, 0.3, 0.7]} />

        <meshStandardMaterial
          color="#151515"
        />
      </mesh>


      {/* =========================
          LEFT SUPPORT
      ========================= */}

      <mesh position={[-0.25, 0.2, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.08]} />

        <meshStandardMaterial
          color="#151515"
        />
      </mesh>


      {/* =========================
          RIGHT SUPPORT
      ========================= */}

      <mesh position={[0.25, 0.2, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.08]} />

        <meshStandardMaterial
          color="#151515"
        />
      </mesh>

    </group>
  );
}

export default Seat;