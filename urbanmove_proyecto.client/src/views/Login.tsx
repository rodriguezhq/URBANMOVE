 import { useState } from 'react';
  import type { FormEvent } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { useAuth } from '../context/AuthContext';

  function Login() {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState<string | null>(null);
      const [submitting, setSubmitting] = useState(false);

      const { login } = useAuth();
      const navigate = useNavigate();

      const handleSubmit = async (e: FormEvent) => {
          e.preventDefault();
          setError(null);
          setSubmitting(true);
          try {
              await login({ email, password });
              navigate('/');
          } catch {
              setError('No vales');
          } finally {
              setSubmitting(false);
          }
      };

      return (
          <form onSubmit={handleSubmit}>
              <h1>Login</h1>
              <div>
                  <label>Corro</label>
                  <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                  />
              </div>
              <div>
                  <label>Contra</label>
                  <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                  />
              </div>
              {error && <p>{error}</p>}
              <button type="submit" disabled={submitting}>
                  {submitting ? 'Ingresando' : 'Ingresar'}
              </button>
          </form>
      );
  }

  export default Login;
