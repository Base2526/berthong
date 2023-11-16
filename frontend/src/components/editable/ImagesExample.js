import React, { useMemo } from 'react'

import { TextEditor } from "./components";

const ImagesExample = () => {
  return (<div className="App">
            <TextEditor maxSavableBlockCount={5}/>
          </div>
  )
}


export default ImagesExample