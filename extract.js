const fs = require("fs");
const path = require("path");
const os = require("os");
const util = require("util");
const glob = require("glob");

const globOptions = {
    absolute: true,
    cwd: process.argv[2] || process.cwd()
};

const cssFile = process.argv[3] || process.cwd() + path.sep + "extracted.css";
const cssClassPrefix = "extracted-";
let cssClassName = "";
let seq = 0;

let html = "";
const stylePattern = /<.*?(style\s*=\s*"(.+?;\s*)").*?>/gm;
const classPattern = /class\s*=\s*"(.*?)"/;
let styleMatched = [];
let classMatched = [];
let files = [];

files = glob.sync("**/*.?(html|ctp)", globOptions);

files.forEach(file => {
    html = fs.readFileSync(file).toString();
    let do_overwrite = false;

    while ((styleMatched = stylePattern.exec(html)) !== null) {
        do_overwrite = true;
        let newTag = "";
        let oldTag = styleMatched[0];
        cssClassName = cssClassPrefix + seq;

        fs.appendFileSync(
            cssFile,
            cssClassName + `: { ${styleMatched[2]} }` + os.EOL
        );

        if (classMatched = classPattern.exec(oldTag)) {
            if(classMatched[1] === "") {
                newTag = oldTag
                    .replace(classMatched[0], `class="${cssClassName}"`)
                    .replace(styleMatched[1], "")
                    .replace(/\s+/, " ")
                    .replace(/\s+>/, ">");
            } else {
                newTag = oldTag
                    .replace(classMatched[0], `class="${classMatched[1]} ${cssClassName}"`)
                    .replace(styleMatched[1], "")
                    .replace(/\s+/, " ")
                    .replace(/\s+>/, ">");
            }
        } else {
            newTag = oldTag
                .replace(">", ` class="${cssClassName}">`)
                .replace(styleMatched[1], "")
                .replace(/\s+/, " ")
                .replace(/\s+>/, ">");
        }
        html = html.replace(oldTag, newTag);
        seq++;
    }

    if(do_overwrite) {
        fs.writeFileSync(file, html);
    }
});

