import { useMemo, useState } from 'react';
import { getStr } from './md';

function App() {
  const [content, setContent] = useState(`# Title
## Subtitle
### Sub-subtitle
This is a paragraph with **bold** and *italic* text, as well as a [link](http://example.com) and an image: 
![alt text](https://img2.baidu.com/it/u=4206823861,2043582464&fm=253&fmt=auto&app=120&f=JPEG?w=100&h=100)

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
| Header1 | Header2 | Header3 |
|---------|---------|---------|
| Cell1   | Cell2   | Cell3   |
| Cell4   | Cell5   | Cell6   |

> This is a blockquote.
Another paragraph.
`);

  const handleChange = (e) => {
    console.log(e.target.value);
    setContent(e.target.value);
  };
  const htmlString = useMemo(() => {
    return getStr(content);
  }, [content]);
  return (
    <div style={{ display: 'flex' }}>
      <textarea
        value={content}
        onChange={handleChange}
        style={{
          width: '600px',
          border: '1px solid #ccc',
          backgroundColor: '#f9f9f9',
          fontFamily: 'Arial, sans-serif',
          fontSize: '18px',
          lineHeight: '1.5',
        }}
      />
      <div style={{ padding: '20px' }} dangerouslySetInnerHTML={{ __html: htmlString }} />
    </div>
  )
}

export default App
