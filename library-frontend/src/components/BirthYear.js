import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { EDIT_AUTHOR } from '../queries'

const BirthYear = () => {
    const [name, setName] = useState('')
    const [year, setYear] = useState('')
    const [ editAuthor ] = useMutation(EDIT_AUTHOR) 
    const submit = (event) => {
        event.preventDefault()
        editAuthor({ variables: { name, setBornTo: Number(year) } })
        setName('')
        setYear('')
    }
    return(
        <div>
            <h2> Set birthyear </h2>
            <form onSubmit = {submit}>
            <div>
                name <input
                    value={name}
                    onChange={({ target }) => setName(target.value)}
                />
            </div>
            <div>
                born <input
                    value={year}
                    onChange={({ target }) => setYear(target.value)}
                />
            </div>
        <button type='submit'>change number</button>
            </form>
        </div>
    )
}

export default BirthYear