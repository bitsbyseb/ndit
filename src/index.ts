#!/usr/bin/env node
import chalk from "chalk";
import type { commandStructure } from "./models/command.model";
import EditorService from "./services/editor.service";

const commands: commandStructure[] = [
    {
        name: "down",
        description:"go one line down",
        action: (_, rl,editor) => {
            rl.write(null, { ctrl: true, name: "l" });
            editor.outputFile(true);
        },
    },
    {
        name: "up",
        description:"go one line up",
        action: (_, rl,editor) => {
            rl.write(null, { ctrl: true, name: "l" });
            editor.outputFile(false);
        },
    },
    {
        name: ".edit:",
        description:"edit a line",
        action: (data, rl,editor) => {
            const lineNumber = parseInt(data.substring(6));
            rl.once("line", (data) => {
                editor.editLine(lineNumber, data);
                editor.intl.write(null, { ctrl: true, name: "l" });
                editor.outputFile();
            });
        },
    },
    {
        name: ".dl:",
        description:"delete a line",
        action(data, rl,editor) {
            const lineNumber = parseInt(data.substring(4));
            editor.deleteLine(lineNumber);
            rl.write(null, { ctrl: true, name: "l" });
            editor.outputFile();
        },
    },
    {
        name: ".exit",
        description:"close the editor",
        action(_,rl,editor) {
            rl.close();
            process.exit(0);
        },
    },
    {
        name: ".clear",
        description:"clear the screen",
        action(_, rl,editor) {
            rl.write(null, { ctrl: true, name: "l" });
            editor.outputFile();
        },
    },
    {
        name:".help",
        description:"show this message",
        action(_,rl,editor) {
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