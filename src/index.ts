#!/usr/bin/env node
import chalk from "chalk";
import type { commandStructure } from "./models/command.model";
import EditorService from "./services/editor.service";

const commands: commandStructure[] = [
    {
        name: "down",
        description:"go one line down",
        action: (_, rl) => {
            rl.write(null, { ctrl: true, name: "l" });
            editorInstance.outputFile(true);
        },
    },
    {
        name: "up",
        description:"go one line up",
        action: (_, rl) => {
            rl.write(null, { ctrl: true, name: "l" });
            editorInstance.outputFile(false);
        },
    },
    {
        name: ".edit:",
        description:"edit a line",
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
        description:"delete a line",
        action(data, rl) {
            const lineNumber = parseInt(data.substring(4));
            editorInstance.deleteLine(lineNumber);
            rl.write(null, { ctrl: true, name: "l" });
            editorInstance.outputFile();
        },
    },
    {
        name: ".exit",
        description:"close the editor",
        action(_,rl) {
            rl.close();
            process.exit(0);
        },
    },
    {
        name: ".clear",
        description:"clear the screen",
        action(_, rl) {
            rl.write(null, { ctrl: true, name: "l" });
            editorInstance.outputFile();
        },
    },
    {
        name:".help",
        description:"show this message",
        action(_,rl) {
            rl.write(null, { ctrl: true, name: "l" });
            for (let i = 0; i < commands.length; i++) {
                const element = commands[i];
                process.stdout.write(`\t${chalk.red(element.name)}\n`);
                process.stdout.write(`\t\t${element.description}\n`);
            }
        },
    }
] as const;

const editorInstance = EditorService.getInstance(commands);