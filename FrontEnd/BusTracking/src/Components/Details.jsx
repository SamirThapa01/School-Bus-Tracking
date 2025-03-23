import React from 'react'

function Details({label,value}) {
  return (
    <div className="detail-item">
    <span>{label}:</span>
    <span>{value}</span>
  </div>
  )
}

export default Details