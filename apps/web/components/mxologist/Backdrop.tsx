// Decorative Diamond Lattice motif — a gold argyle grid masked to fade
// toward center. Sits behind everything at z-index 0, non-interactive.
export default function Backdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(201,165,92,.05) 0 1px, transparent 1px 28px),repeating-linear-gradient(-45deg, rgba(201,165,92,.05) 0 1px, transparent 1px 28px)",
        WebkitMaskImage:
          "radial-gradient(135% 105% at 50% 0%, #000 28%, transparent 92%)",
        maskImage:
          "radial-gradient(135% 105% at 50% 0%, #000 28%, transparent 92%)",
      }}
    />
  );
}
