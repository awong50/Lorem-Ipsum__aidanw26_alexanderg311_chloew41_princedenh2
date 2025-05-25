import LogoutButton from '../components/LogoutButton';

const Home = () => {
  const isLoggedIn = !!localStorage.getItem('user');

  return (
    <div>
      <h1>Home Page</h1>
      {isLoggedIn && <LogoutButton />}
    </div>
  );
};

export default Home;