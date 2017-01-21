import { sayHello } from "./greet";
import * as fs from "fs";
import * as es6Promise from "es6-promise";

// TODO: support relative and absolute file paths based on html paths

interface IDocument {
  filename: string;
  elementId: string;
}

class Library {
  static elementIdPrefix: string = "merge-html-";
  documentsByFilename: { [filename: string]: IDocument } = {};
  documentsCount: number = 0;

  public addDocument(filename: string): IDocument {
    if (this.hasDocument(filename)) {
      throw `File ${filename} already exist in this library.`;
    }
    this.documentsCount++;
    var document = {
      filename: filename,
      elementId: Library.elementIdPrefix + this.documentsCount
    }
    this.documentsByFilename[filename] = document;
    return document;
  }

  
  public hasDocument(filename: string) {
    return this.documentsByFilename.hasOwnProperty(filename);
  }
}

async function readFile(filename: string): Promise<string> {
  // TODO: make it async
  // return await fs.readFile(filename, "utf8");
  return new es6Promise.Promise<string>((resolve, reject) => {
    fs.readFile(filename, "utf8", (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function extractContent(fullContent: string) : string {
   var regexp = /[\S\s]*<body>([\S\s]*)<\/body>[\S\s]*/gi;
   var item = regexp.exec(fullContent);
   return item[1];
}

function getReferencedFilenames(content: string): string[] {
  var result = [];
  var regexp = /href=["'](.*?\.html)["']/gi;
  // it is not working?
  var item;
  while(item = regexp.exec(content)) {
    result.push(item[1]);
  }
  return result;
}

async function processFile(library: Library, filename: string) : Promise<string> {
  var result = "";
  if (!library.hasDocument(filename)) {
    var fullContent = await readFile(filename);
    var content = extractContent(fullContent);
    result += content;
    var document = library.addDocument(filename);
    getReferencedFilenames(content).forEach(async rf => {
        result += await processFile(library, rf);
    });
  }
  return result;
}

export default async function main(argv: string[]) {
  var library = new Library();
  var result = await processFile(library, argv[2] || "index.html");
  console.log(result);
  console.log(library);
}
