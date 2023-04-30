import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
}

export function chatHrefConstrictor(id1: string, id2: string): string {
   const sortedIds = [id1, id2].sort();

   return `${sortedIds[0]}--${sortedIds[1]}`;
}