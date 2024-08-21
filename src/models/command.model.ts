import type {Interface } from "node:readline";
export interface commandStructure {
    name: string,
    description:string,
    action: (data: string,rl:Interface) => void,
};