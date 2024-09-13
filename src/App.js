
import React, { useState } from 'react';
import Auth from './components/LoginPage';
import WeatherSearch from './components/WeatherPage';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      {!user ? (
        <Auth setUser={setUser} />
      ) : (
        <WeatherSearch user={user} />
      )}
    </div>
  );
}

export default App;
