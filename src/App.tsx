import { getStr } from './md';

function App() {
  const htmlString = getStr();
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  )
}

export default App
