// frontend/pages/_app.js
import '../styles/globals.css'; // <- Import your global stylesheet here

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
