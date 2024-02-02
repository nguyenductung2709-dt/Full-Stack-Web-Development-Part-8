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
  const booksFiltered = books.filter(book => book.genres.includes(genre))
  const genresDefault = books.map(book => book.genres)
  const genres = Array.from(new Set([].concat(...genresDefault)))
  return (
    <div>
      <h2>books</h2>
      <p> in genre <strong> {genre} </strong> </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksFiltered.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map((genre) => (
        <button onClick = {() => setGenre(`${genre}`)}>{genre}</button>
      ))}
    </div>
  )
}

export default Books
