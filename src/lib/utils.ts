import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface MachineComponent {
  id: string;
  name: string;
  type: string;
  description: string;
  connections: string[];
}

export interface MachineBlueprint {
  id: string;
  name: string;
  concept: string;
  components: MachineComponent[];
  principles: string[];
}
