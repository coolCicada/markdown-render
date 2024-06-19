class Token {
    constructor(public type: string, public value: string) {}
}

class MarkdownNode {
    children: MarkdownNode[] = [];
    constructor(public type: string, public value: string = '') {}
}

function tokenize(markdown: string): Token[] {
    const tokens: Token[] = [];
    const lines = markdown.split('\n');
    const regex = {
        header: /^(#{1,6})\s+(.*)$/,
        hr: /^-{3,}$/,
        list: /^(\*|\d+\.)\s+(.*)$/,
        blockquote: /^>\s+(.*)$/,
        codeBlock: /^```(\w*)$/,
        table: /^\|.*\|$/,
        tableSeparator: /^\|-{3,}-*\|$/,
        inlineCode: /`([^`]+)`/,
        bold: /\*\*(.*?)\*\*/g,
        italic: /\*(.*?)\*/g,
        link: /\[([^\]]+)\]\(([^)]+)\)/g,
        image: /!\[([^\]]*)\]\(([^)]+)\)/g,
    };

    let inCodeBlock = false;
    lines.forEach(line => {
        if (inCodeBlock) {
            if (regex.codeBlock.test(line)) {
                inCodeBlock = false;
                tokens.push(new Token('codeBlockEnd', ''));
            } else {
                tokens.push(new Token('codeLine', line));
            }
        } else {
            if (regex.codeBlock.test(line)) {
                inCodeBlock = true;
                tokens.push(new Token('codeBlockStart', line.match(regex.codeBlock)![1]));
            } else if (regex.header.test(line)) {
                const match = line.match(regex.header)!;
                tokens.push(new Token(`header${match[1].length}`, match[2]));
            } else if (regex.hr.test(line)) {
                tokens.push(new Token('hr', ''));
            } else if (regex.list.test(line)) {
                const match = line.match(regex.list)!;
                tokens.push(new Token('listItem', match[2]));
            } else if (regex.blockquote.test(line)) {
                const match = line.match(regex.blockquote)!;
                tokens.push(new Token('blockquote', match[1]));
            } else if (regex.table.test(line)) {
                tokens.push(new Token('tableRow', line));
            } else if (regex.tableSeparator.test(line)) {
                tokens.push(new Token('tableSeparator', ''));
            } else {
                tokens.push(new Token('paragraph', line));
            }
        }
    });

    return tokens;
}

function parse(tokens: Token[]): MarkdownNode {
    const root = new MarkdownNode('root');
    let currentNode = root;
    let tableBuffer: string[] = [];

    tokens.forEach(token => {
        switch (token.type) {
            case 'header1':
            case 'header2':
            case 'header3':
            case 'header4':
            case 'header5':
            case 'header6':
            case 'paragraph':
            case 'blockquote':
            case 'hr':
                currentNode.children.push(new MarkdownNode(token.type, token.value));
                break;
            case 'listItem':
                if (currentNode.type !== 'list') {
                    const listNode = new MarkdownNode('list');
                    root.children.push(listNode);
                    currentNode = listNode;
                }
                currentNode.children.push(new MarkdownNode('listItem', token.value));
                break;
            case 'codeBlockStart':
                const codeBlockNode = new MarkdownNode('codeBlock', token.value);
                root.children.push(codeBlockNode);
                currentNode = codeBlockNode;
                break;
            case 'codeBlockEnd':
                currentNode = root;
                break;
            case 'codeLine':
                currentNode.children.push(new MarkdownNode('codeLine', token.value));
                break;
            case 'tableRow':
            case 'tableSeparator':
                tableBuffer.push(token.value);
                if (token.type === 'tableSeparator') {
                    const tableNode = new MarkdownNode('table', tableBuffer.join('\n'));
                    root.children.push(tableNode);
                    tableBuffer = [];
                }
                break;
            default:
                throw new Error(`Unknown token type: ${token.type}`);
        }
    });

    return root;
}

function render(node: MarkdownNode): string {
    switch (node.type) {
        case 'root':
            return node.children.map(render).join('\n');
        case 'header1':
            return `<h1>${node.value}</h1>`;
        case 'header2':
            return `<h2>${node.value}</h2>`;
        case 'header3':
            return `<h3>${node.value}</h3>`;
        case 'header4':
            return `<h4>${node.value}</h4>`;
        case 'header5':
            return `<h5>${node.value}</h5>`;
        case 'header6':
            return `<h6>${node.value}</h6>`;
        case 'paragraph':
            return `<p>${renderInline(node.value)}</p>`;
        case 'blockquote':
            return `<blockquote>${node.value}</blockquote>`;
        case 'hr':
            return `<hr />`;
        case 'list':
            return `<ul>${node.children.map(render).join('')}</ul>`;
        case 'listItem':
            return `<li>${renderInline(node.value)}</li>`;
        case 'codeBlock':
            return `<pre><code class="${node.value}">${node.children.map(render).join('\n')}</code></pre>`;
        case 'codeLine':
            return node.value;
        case 'table':
            return renderTable(node.value);
        default:
            throw new Error(`Unknown node type: ${node.type}`);
    }
}

function renderInline(text: string): string {
    const regex = {
        inlineCode: /`([^`]+)`/,
        bold: /\*\*(.*?)\*\*/g,
        italic: /\*(.*?)\*/g,
        link: /\[([^\]]+)\]\(([^)]+)\)/g,
        image: /!\[([^\]]*)\]\(([^)]+)\)/g,
    };

    text = text.replace(regex.image, '<img src="$2" alt="$1" />');
    text = text.replace(regex.link, '<a href="$2">$1</a>');
    text = text.replace(regex.bold, '<strong>$1</strong>');
    text = text.replace(regex.italic, '<em>$1</em>');
    text = text.replace(regex.inlineCode, '<code>$1</code>');

    return text;
}

function renderTable(tableText: string): string {
    const lines = tableText.split('\n');
    const headers = lines[0].split('|').map(header => header.trim());
    const rows = lines.slice(2).map(line => line.split('|').map(cell => cell.trim()));

    const headerHtml = headers.map(header => `<th>${header}</th>`).join('');
    const rowsHtml = rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');

    return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
}

// 示例 Markdown 文本
const markdown = `
# Title
## Subtitle
### Sub-subtitle
This is a paragraph with **bold** and *italic* text, as well as a [link](http://example.com) and an image: ![alt text](https://i2.hdslb.com/bfs/face/3611dc2a0e59a13cb371d82acf2f97c2acc247cf.jpg@120w_120h_1c.avif).

\`\`\`javascript
console.log('Hello, world!');
\`\`\`

- List item 1
- List item 2
- List item 3

> This is a blockquote.

| Header1 | Header2 | Header3 |
|---------|---------|---------|
| Cell1   | Cell2   | Cell3   |
| Cell4   | Cell5   | Cell6   |

---

Another paragraph.
`;

// Tokenize, parse, and render the Markdown
const tokens = tokenize(markdown);
const ast = parse(tokens);
const html = render(ast);

console.log(html);