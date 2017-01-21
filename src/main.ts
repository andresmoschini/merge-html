import { sayHello } from "./greet";
import * as fs from "fs";

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

function readFile(filename: string): string {
  // TODO: make it async
  return fs.readFileSync(filename, "utf8");
}

function getReferencedFilenames(content: string): string[] {
  var result = [];
  var regexp = /href=["'](.*?\.html)["']/g;
  var item;
  while(item = regexp.exec(content)) {
    result.push(item[1]);
  }
  return result;
}

function processFile(library: Library, filename: string) : string {
  var result = "";
  if (!library.hasDocument(filename)) {
    var content = readFile(filename);
    result += content;
    var document = library.addDocument(filename);
    getReferencedFilenames(content).forEach(rf => {
        result += processFile(library, rf);
    });
  }
  return result;
}

export default function main(argv: string[]) {
  var library = new Library();
  var result = processFile(library, argv[2] || "index.html");
  console.log(result);
  console.log(library);
}
