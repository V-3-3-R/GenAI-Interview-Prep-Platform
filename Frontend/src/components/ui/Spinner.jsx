import React from 'react'
import './spinner.scss'

/**
 * Themed loading spinner shown on all loading screens across the app.
 * @param {{ label?: string }} props
 */
const Spinner = ({ label = 'Loading...' }) => {
    return (
        <div className='spinner-screen'>
            <span className='spinner' />
            {label && <p className='spinner-label'>{label}</p>}
        </div>
    )
}

export default Spinner
