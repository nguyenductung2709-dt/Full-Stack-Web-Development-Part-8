import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN, ME } from '../queries';

const LoginForm = ({ setToken, show, setPage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  const [login, result] = useMutation(LOGIN);
  //const meResult = useQuery(ME);

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem('user_token', token);
      console.log(token);
    }
  }, [result.data, setToken]);


  /*useEffect(() => {
    if (meResult.data && meResult.data.me) {
      setUser(meResult.data.me.username);
      console.log(meResult.data.me.username);
    }
  }, [setToken]);*/
  
  const submit = async (event) => {
    event.preventDefault();
    login({ variables: { username, password } });
    setPage("authors");
  };

  if (!show) {
    return null;
  }

  return (
    <div>
      {!user ? (
        <div>
        <form onSubmit={submit}>
          <div>
            username{' '}
            <input
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password{' '}
            <input
              type='password'
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type='submit'>login</button>
        </form>
        </div>

      ) : (
        <h1>{user} logged in</h1>
      )}
    </div>
  );
};

export default LoginForm;
