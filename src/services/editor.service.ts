import {writeFileSync,readFileSync} from 'node:fs';
import { createInterface } from 'node:readline';
import type { commandStructure } from '../models/command.model';
import {join} from 'node:path';
import chalk from 'chalk';

export default class EditorService {
    static instance:EditorService;
    static editorName = "Ndit";
    private fileName = process.argv[2] ?? join(__filename.substring(0,__filename.length-32),'test.txt');
    private lines: string[] = [];
    public intl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    private MAX_LINE_PER_PAGE = 30;
    private startLine = 1;
    public outputFile: Function;

    private constructor(commands: commandStructure[]) {
        this.lines = this.readFileLines();
        this.outputFile = this.logFile();
        this.setupInterface(commands);
        this.outputFile(false);
    }
    
    static getInstance(commands:commandStructure[]) {
        if (!EditorService.instance) {
            EditorService.instance = new EditorService(commands);
        }
        return EditorService.instance;
    }
    
    private readFileLines(): string[] {
        return readFileSync(this.fileName, { encoding: "utf-8" }).split(/\n/g);
    }
    
    private setupInterface(commands: commandStructure[]) {
        this.intl.on("line", (data) => {
            const command = commands.find((value) => data.startsWith(value.name));
            command?.action(data, this.intl);
        });
    }
    
    logFile() {
        return (scrollDown?: boolean) => {
            if (this.lines.length < this.MAX_LINE_PER_PAGE) {
                this.MAX_LINE_PER_PAGE = this.lines.length;
            }

            if (scrollDown && (this.startLine + this.MAX_LINE_PER_PAGE < this.lines.length)) {
                this.startLine++;
            }
            
            if (!scrollDown && this.startLine > 0) {
                this.startLine--;
            }
            
            this.printLines();
            this.printStatusBar(this.startLine, this.lines.length);
        };
    }

    private printLines() {
        process.stdout.write("\n" + ("-".repeat(process.stdout.columns)) + "\n");
        for (let i = 0; i < this.MAX_LINE_PER_PAGE; i++) {
            const currentLineIndex = (i + this.startLine + 1) > this.lines.length
                ? (i + this.startLine + 1) - this.MAX_LINE_PER_PAGE
                : i + this.startLine + 1;
            if (currentLineIndex > 0) {
                process.stdout.write(
                    `${chalk.red(currentLineIndex)}\t|${chalk.white(this.lines[currentLineIndex - 1] ?? "")}\n`
                );
            }
        }
        process.stdout.write("-".repeat(process.stdout.columns) + "\n");
    }

    private printStatusBar(startLine: number, totalFileLines: number) {
        process.stdout.write(
            `${chalk.bgRed(EditorService.editorName)}\t${chalk.red(this.fileName + "\t\t" + this.fileName.substring(this.fileName.indexOf(".")) + " ")}${chalk.bgRed(" " + Math.floor((startLine / totalFileLines) * 100) + "% in " + startLine + "/" + totalFileLines)}\n`
        );
    }

     editLine(lineToEdit: number, data: string) {
        try {
            this.lines[lineToEdit - 1] = data;
            writeFileSync(this.fileName, this.lines.join("\n"), { encoding: "utf-8" });
        } catch (error) {
            console.error("Bad file handling", error);
        }
    }

    deleteLine(lineToDelete: number) {
        try {
            this.lines.splice(lineToDelete - 1, 1);
            writeFileSync(this.fileName, this.lines.join("\n"));
        } catch (error) {
            console.error("Something went wrong deleting the line", error);
        }
    }
}
