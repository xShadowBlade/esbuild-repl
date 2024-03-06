#!/usr/bin/env node

// import "source-map-support/register";

import fs from "fs";
import path from "path";
import { argv } from "process";
import * as esbuild from "esbuild";

const outFileName = "output.js";
const outfile = path.join(__dirname, `../files/${outFileName}`);
console.log("Output file:", outfile);

/**
 * Extracts command-line arguments and flags from the process arguments.
 * @returns {[string[], {[flag: string]: string | boolean}]} Tuple containing arguments and flags.
 */
const [args, flags] = (() => {
    const argsA: string[] = [];
    const flagsA = {} as { [flag: string]: string | boolean };
    argv.forEach((item) => {
        if (item.match(/^(-|--)+/)) { // If it is a flag
            item = item.replace(/(-|--)+/g, "");
            const arr = item.split("=");
            flagsA[arr[0]] = arr[1] ? arr[1] : true;
        } else {
            argsA.push(item);
        }
    });
    return [argsA, flagsA];
})();

if (flags["d"] || flags["debug"]) console.log("argv:", argv, "Args:", args, "\n", "Flags:", flags);

/**
 * Represents the main entry point for the QuarkScript CLI tool.
 */
const [, , fileToRun] = args;

if (!fileToRun) {
    console.error("No file to run specified.");
    process.exit(1);
}

const file = path.resolve(fileToRun);
if (!fs.existsSync(file)) {
    console.error("File does not exist.");
    process.exit(1);
}

esbuild.build({
    entryPoints: [file],
    outfile: outfile,
    bundle: true,
    platform: "node",
    target: "node14",
    // external: ["source-map-support"],
    sourcemap: "linked",
    // minify: true,
    format: "cjs",
})
    // .then(() => {
    //     // Prepend source-map-support to the output file
    //     const fileContents = fs.readFileSync(outfile, "utf-8");
    //     const newContents = `import "source-map-support/register";\n${fileContents}\n//# sourceMappingURL=output.js.map`;
    //     fs.writeFileSync(outfile, newContents);
    // })
    // .then(() => {
    //     // Build it again (very inefficient, but it works)
    //     return esbuild.build({
    //         allowOverwrite: true,
    //         entryPoints: [outfile],
    //         outfile: outfile,
    //         bundle: true,
    //         platform: "node",
    //         target: "node14",
    //         // external: ["source-map-support"],
    //         // sourcemap: "inline",
    //         // minify: true,
    //         format: "cjs",
    //         // logLevel: "info",
    //     });   
    // })
    // .then(() => {
    //     // Prepend "//# sourceMappingURL=output.js.map\n" to the output file
    //     const fileContents = fs.readFileSync(outfile, "utf-8");
    //     const newContents = `//# sourceMappingURL=output.js.map\n${fileContents}`;
    //     fs.writeFileSync(outfile, newContents);
    // })
    .then(() => {
        console.log("File built successfully.");
        // Run the file
        // import("../files/output.js");
        // import(outfile);
        // require(outfile);
        // Run the file (but with --enable-source-maps)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("source-map-support").install();
        require(outfile);
    })
    .catch((e) => {
        console.error("Failed to build file:", e);
        process.exit(1);
    });

// if (!subCommand || (!subCommand && (flags["h"] || flags["help"]))) displayHelp();