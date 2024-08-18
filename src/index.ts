import * as fs from "node:fs";
import { argv, stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline";
import chalk from "chalk";

type editorModes = "edit" | "visual";

const global = {
    EditorMode: "edit",
    pathToFile: argv[2],
};

const intl = createInterface({
    input,
    output,
});

function getStringMaxLength(arr: string[]): number {
    let result = -Infinity;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].length > result) {
            result = arr[i].length;
        }
    }
    return result;
}

interface statusBarProps {
    totalFileLines: number;
    startLine: number;
}
function printStatusBar({ startLine, totalFileLines }: statusBarProps) {
    // TODO:print status bar like neovim, and then add edit and visual mode
    // as global status, with that in mind, we can handle that behavor from
    // the global status and make very useful things to the user
    process.stdout.write(
        `${chalk.bgRed(global.EditorMode)}\t${
            chalk.red(
                global.pathToFile + "\t\t" +
                    global.pathToFile.substring(global.pathToFile.indexOf("."))+" ")
        }${
            chalk.bgRed(
                " " + Math.floor((startLine / totalFileLines) * 100) + "% in " +
                    startLine + "/" + totalFileLines,
            )
        }\n`,
    );
}

function logFile() {
    let maxLinePerPage = 30;
    let startLine = 1;
    const content = fs.readFileSync(global.pathToFile, { encoding: "utf-8" });
    const chunks: string[] = content.split(/\n/g);
    chunks[chunks.length - 1] = `${chunks[chunks.length - 1]}\0`;
    return (scrollDown?: boolean) => {
        if (chunks.length < maxLinePerPage) {
            maxLinePerPage = chunks.length;
        }

        if (scrollDown && (startLine + maxLinePerPage < chunks.length)) {
            startLine++;
        }

        if (!scrollDown && startLine > 0) {
            startLine--;
        }

        process.stdout.write(
            "\n" + ("-".repeat(getStringMaxLength(chunks) / 2)) + "\n",
        );
        for (let i = 0; i < maxLinePerPage; i++) {
            const currentLineIndex = (i + startLine + 1) > chunks.length
                ? (i + startLine + 1) - maxLinePerPage
                : i + startLine + 1;
            if (currentLineIndex > 0) {
                process.stdout.write(
                    `\u001b[31m${currentLineIndex}\t|\u001b[40m\t\u001b[97m${
                        chunks[currentLineIndex - 1] ?? ""
                    }\u001b[40m\n`,
                );
            }
        }
        process.stdout.write(
            ("-".repeat(getStringMaxLength(chunks) / 2)) + "\n",
        );
        printStatusBar({ startLine, totalFileLines: chunks.length });
    };
}

function editFile(lineToEdit: number, data: string) {
    const content = fs.readFileSync(global.pathToFile, { encoding: "utf-8" });
    const chunks: string[] = content.split(/\n/g);
    chunks[lineToEdit - 1] = data;
    fs.writeFileSync(global.pathToFile, chunks.join("\n"));
}
function deleteLine(lineToDelete: number) {
    const content = fs.readFileSync(global.pathToFile, { encoding: "utf-8" });
    const chunks: string[] = content.split(/\n/g);
    chunks.splice(lineToDelete-1, 1);
    fs.writeFileSync(global.pathToFile, chunks.join("\n"));
}

let outputFile = logFile();

outputFile(false);
intl.on("line", (data) => {
    if (data.startsWith("down")) {
        intl.write(null, { ctrl: true, name: "l" });
        outputFile(true);
    }
    if (data.startsWith("up")) {
        intl.write(null, { ctrl: true, name: "l" });
        outputFile(false);
    }
    if (data.startsWith(".edit:")) {
        global.EditorMode = "edit";
        const lineNumber = parseInt(data.substring(6));
        intl.once("line", (data) => {
            editFile(lineNumber, data);
            outputFile = logFile();
            intl.write(null, { ctrl: true, name: "l" });
            outputFile();
        });
        global.EditorMode = "visual";
    }

    if (data.startsWith(".dl:")) {
        const lineNumber = parseInt(data.substring(4));
        deleteLine(lineNumber);
        outputFile = logFile();
        intl.write(null, { ctrl: true, name: "l" });
        outputFile();
    }
    if (data.startsWith(".exit")) process.exit(0);
    if (data.startsWith(".clear")) {
        intl.write(null, { ctrl: true, name: "l" });
        outputFile();
    }
});
