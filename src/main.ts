import { sayHello } from "./greet";

class Document {
  filename: string;
  elementId: string;
  content: string;
  getReferencedFilenames = function(): string[] {
      return [];
  }
}

class Library {
  static elementIdPrefix: string = "merge-html-";
  documents: Document[] = [];
  documentsByFilename: { [filename: string]: Document } = {}; 
  documentsCount: number = 0;

  public addDocument(filename: string, content: string): Document {
    if (this.hasDocument(filename)) {
      throw `File ${filename} already exist in this library.`;
    }
    this.documentsCount++;
    var document = new Document();
    document.filename = filename;
    document.elementId = Library.elementIdPrefix + this.documentsCount;
    document.content = content;
    this.documents.push(document);
    this.documentsByFilename[filename] = document;
    return document;
  }

  public hasDocument(filename: string) {
    return this.documentsByFilename.hasOwnProperty(filename);
  }
}

interface resultTree {
    body: string;
    childs: resultTree;
}

function readFile(filename: string) {
    return filename;
}



function processFile(library: Library, filename: string) {
  if (!library.hasDocument(filename)) {
    var content = readFile(filename);
    var document = library.addDocument(filename, content);
    document.getReferencedFilenames().forEach(rf => {
        processFile(library, rf);
    });
  }
}

export default function main(argv: string[]) {
  var library = new Library();
  processFile(library, argv[2] || "index.html");
  console.log(library);
} 
