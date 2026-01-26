import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import jsBeautify from 'js-beautify';

// destructure the html function
const { html: beautifyHtml } = jsBeautify;

// Paths
const templatePath = path.join('templates', 'index.template.html');
const bioPath = path.join('content', 'bio.md');
const outputPath = 'index.html';

// Read template
let template = fs.readFileSync(templatePath, 'utf-8');

// Read Markdown and convert to HTML
const bioMarkdown = fs.readFileSync(bioPath, 'utf-8');
const bioHtml = marked.parse(bioMarkdown);

// Replace placeholder
let finalHtml = template.replace('<!-- {{BIO_MARKDOWN}} -->', bioHtml);

// Beautify HTML for human readability
finalHtml = beautifyHtml(finalHtml, {
  indent_size: 2,
  preserve_newlines: true,
  max_preserve_newlines: 2
});

// Write to root index.html 
fs.writeFileSync(outputPath, finalHtml);

console.log('✅ index.html generated and formatted nicely!');
