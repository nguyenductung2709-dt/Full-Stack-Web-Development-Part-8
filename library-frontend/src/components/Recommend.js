import React, { useEffect } from 'react';
import { ME, ALL_BOOKS } from '../queries';
import { useQuery } from '@apollo/client';

const Recommend = ({ show, token }) => {
  const { loading, error, data, refetch } = useQuery(ME, {
    skip: !token,
  });

  const result = useQuery(ALL_BOOKS)
  const books = result.data ? result.data.allBooks : []

  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token, refetch]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const user = data ? data.me : null;

  let booksFiltered 

  if (user) {
    booksFiltered = books.filter(book => book.genres.includes(user.favoriteGenre));
  }

  if (!show || !user) {
    return null;
  }

  return (
    <>
      <h2>Recommendations</h2>
      <p>Books in your favorite genre <strong>{user.favoriteGenre}</strong></p>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
          </tr>
        </thead>
        <tbody>
          {booksFiltered.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
  
};

export default Recommend;
