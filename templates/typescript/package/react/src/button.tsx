import React from 'react'

interface ButtonProps {
  type?: 'primary'
}

export const Button: React.FC<ButtonProps> = ({ type }) => {
  return <button className="button">button: type {type}</button>
}
