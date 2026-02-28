import Image from "next/image";

export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0F0F0F" }}
    >
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/logo.png"
          alt="Loading Duta Wisata Batam"
          width={96}
          height={96}
          style={{
            filter: "drop-shadow(0 0 14px rgba(212,175,55,0.45))",
          }}
          priority
        />
        <div className="loader" style={{ color: "#D4AF37" }} />
      </div>
    </div>
  );
}
