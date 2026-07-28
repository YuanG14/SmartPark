interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-base" };

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, imageUrl, size = "md" }: AvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`rounded-full object-cover ${sizeClasses[size]}`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700 ${sizeClasses[size]}`}
    >
      {initials(name)}
    </div>
  );
}
