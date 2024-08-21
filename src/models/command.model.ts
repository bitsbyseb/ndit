import type {Interface } from "node:readline";
export interface commandStructure {
    name: string;
    action: (data: string,rl:Interface) => void;
};