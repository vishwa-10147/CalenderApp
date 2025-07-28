import { useState } from 'react';
import { supabase } from './services/supabaseclient';

export default function Signup({ onSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else onSignup(data.user);
  };

  return (
    <form onSubmit={handleSignup} style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Create Account</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Sign Up</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
