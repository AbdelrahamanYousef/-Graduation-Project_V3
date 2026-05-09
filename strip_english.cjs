const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove isEn declaration
    content = content.replace(/const isEn\s*=\s*(getLanguage\(\)\s*===\s*'en'|\(\)\s*=>\s*getLanguage\(\)\s*===\s*'en');?/g, '');

    // Now we need to remove `isEn ? X : Y` -> `Y`
    // We will do this carefully: while `isEn ?` exists in the string, we find its bounds.
    let index = 0;
    while ((index = content.indexOf('isEn ?', index)) !== -1) {
        // find the colon
        let colonIndex = -1;
        let depth = 0;
        for (let i = index + 6; i < content.length; i++) {
            if (content[i] === '(' || content[i] === '{' || content[i] === '[') depth++;
            if (content[i] === ')' || content[i] === '}' || content[i] === ']') depth--;
            if (content[i] === ':' && depth === 0) {
                colonIndex = i;
                break;
            }
        }
        
        if (colonIndex !== -1) {
            // we found the colon. Now we need to find the end of the Y expression.
            // In JavaScript, finding the end of an expression is hard.
            // If it's a simple ternary `A ? B : C`, C ends at `,`, `}`, `)`, `\n`, `;`, or EOF, provided depth is 0.
            let endIndex = -1;
            depth = 0;
            for (let i = colonIndex + 1; i < content.length; i++) {
                if (content[i] === '(' || content[i] === '{' || content[i] === '[') depth++;
                if (content[i] === ')' || content[i] === '}' || content[i] === ']') {
                    if (depth === 0) {
                        endIndex = i;
                        break;
                    }
                    depth--;
                }
                if ((content[i] === ',' || content[i] === ';' || content[i] === '\n') && depth === 0) {
                    endIndex = i;
                    break;
                }
            }
            if (endIndex === -1) endIndex = content.length;
            
            // Extract Y
            let yExpr = content.substring(colonIndex + 1, endIndex).trim();
            
            // Replace the whole ternary `isEn ? X : Y` with `Y`
            content = content.substring(0, index) + yExpr + content.substring(endIndex);
            // Don't advance index, as we modified the string and need to process from the same spot if there are multiple
        } else {
            index += 6; // move past if we couldn't parse
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

walk('./src');
