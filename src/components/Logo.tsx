import jnuLogo from "@/assets/jnu-logo.png";

export function JnuLogo({ className = "size-9" }: { className?: string }) {
  return (
    <img
      src={jnuLogo}
      alt="Jaipur National University"
      className={className + " rounded-lg bg-white object-contain p-0.5 shadow-glow"}
      loading="eager"
    />
  );
}
