import { Avatar, AvatarImage } from "./ui/avatar";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const avatarVariants = cva("", {
  variants: {
    size: {
      default: "h-9 w-9",
      xs: "h-4 w-4",
      sm: "h-6 w-6",
      lg: "h-10 w-10",
      xl: "h-[160]px w-[160]px",
    },
  },
  defaultVariants: {
    size: "default",                                                                                
  },
});

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  imageurl: string;
  name: string;
  className?: string;
  onClick?: () => void;
}


export const UserAvatar = ({
    imageurl,
    name,
    size,
    className,
    onClick,
}: UserAvatarProps) => {
    return (
        <Avatar className={cn(avatarVariants({ size }), className)}>
           <AvatarImage src={imageurl} alt={name} />
        </Avatar>
    )
}
