import type {Interface } from "node:readline";
import EditorService from "../services/editor.service";
export interface commandStructure {
    name: string,
    description:string,
    action: (data: string,rl:Interface,editor:EditorService) => void,
};