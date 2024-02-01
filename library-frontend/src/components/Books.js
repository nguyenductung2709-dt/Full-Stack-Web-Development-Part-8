import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'
import { useState } from 'react'
const Books = (props) => {
  const result = useQuery(ALL_BOOKS)

  const [genre, setGenre] = useState('')

  if (!props.show) {
    return null
  }

  const books = result.data ? result.data.allBooks : []
  const genresDefault = books.map(book => book.genres)
  const genres = Array.from(new Set([].concat(...genresDefault)))
  console.log(genres)
  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
