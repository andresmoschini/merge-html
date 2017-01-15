import { sayHello } from "./greet";
import * as fs from "fs";

// TODO: support relative and absolute file paths based on html paths

interface IDocument {
  filename: string;
  elementId: string;
  content: string;
}

class Library {
  static elementIdPrefix: string = "merge-html-";
  documents: IDocument[] = [];
  documentsByFilename: { [filename: string]: IDocument } = {}; 
  documentsCount: number = 0;

  public addDocument(filename: string, content: string): IDocument {
    if (this.hasDocument(filename)) {
      throw `File ${filename} already exist in this library.`;
    }
    this.documentsCount++;
    var document = {
      filename: filename,
      elementId: Library.elementIdPrefix + this.documentsCount,
      content: content
    }
    this.documents.push(document);
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
  return /href="(.*\.html)"/g.exec(content);
}

function processFile(library: Library, filename: string) {
  if (!library.hasDocument(filename)) {
    var content = readFile(filename);
    var document = library.addDocument(filename, content);
    getReferencedFilenames(content).forEach(rf => {
        processFile(library, rf);
    });
  }
}

export default function main(argv: string[]) {
  var library = new Library();
  processFile(library, argv[2] || "index.html");
  console.log(library);
} 
