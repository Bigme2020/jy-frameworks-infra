import React, { FC, ReactElement } from 'react'
import style from './style/index.css'

const a = () => {
  console.log('1')
}
a()

const TextComp: FC = (): ReactElement => {
  return <div className={style.test}></div>
}

export default TextComp
