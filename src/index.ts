#!/usr/bin/env node
import type { commandStructure } from "./models/command.model";
import EditorService from "./services/editor.service";
const pathToFile = process.argv[2];

const commands: commandStructure[] = [
    {
        name: "down",
        action: (_, rl) => {
            rl.write(null, { ctrl: true, name: "l" });
            editorInstance.outputFile(true);
        },
    },
    {
        name: "up",
        action: (_, rl) => {
            rl.write(null, { ctrl: true, name: "l" });
            editorInstance.outputFile(false);
        },
    },
    {
        name: ".edit",
        action: (data, rl) => {
            const lineNumber = parseInt(data.substring(6));
            rl.once("line", (data) => {
                editorInstance.editLine(lineNumber, data);
                editorInstance.intl.write(null, { ctrl: true, name: "l" });
                editorInstance.outputFile();
            });
        },
    },
    {
        name: ".dl:",
        action(data, rl) {
            const lineNumber = parseInt(data.substring(4));
            editorInstance.deleteLine(lineNumber);
            rl.write(null, { ctrl: true, name: "l" });
            editorInstance.outputFile();
        },
    },
    {
        name: ".exit",
        action(_,rl) {
            rl.close();
            process.exit(0);
        },
    },
    {
        name: ".clear",
        action(_, rl) {
            rl.write(null, { ctrl: true, name: "l" });
            editorInstance.outputFile();
        },
    },
] as const;

const editorInstance = new EditorService(pathToFile,commands);