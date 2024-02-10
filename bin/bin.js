#!/usr/bin/env node

// import fs from "fs";
// import path from "path";
// import { argv } from "process";
// import esbuild from "esbuild";

const fs = require("fs");
const path = require("path");
const { argv } = require("process");
const esbuild = require("esbuild");

/**
 * Extracts command-line arguments and flags from the process arguments.
 * @returns {[string[], {[flag: string]: string | boolean}]} Tuple containing arguments and flags.
 */
const [args, flags] = (() => {
    const argsA = [];
    const flagsA = {};
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
    // outfile: "./files/output.js",
    outfile: path.join(__dirname, "../files/output.js"),
    bundle: true,
    platform: "node",
    target: "node14",
    // sourcemap: "external",
    // minify: true,
    format: "cjs",
    logLevel: "info",
})
    .then(() => {
        console.log("File built successfully.");
        // Run the file
        // import("../files/output.js");
        // import(path.join(__dirname, "../files/output.js"));
        require(path.join(__dirname, "../files/output.js"));
    })
    .catch(() => {
        console.error("Failed to build file.");
        process.exit(1);
    });

// if (!subCommand || (!subCommand && (flags["h"] || flags["help"]))) displayHelp();