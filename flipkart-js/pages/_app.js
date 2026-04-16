import '../styles/globals.css';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';
import Footer from '../components/Footer';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 56px)', paddingTop: '56px' }}>
        <Component {...pageProps} />
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '4px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#26a541', secondary: 'white' } },
          error: { iconTheme: { primary: '#ff4040', secondary: 'white' } },
        }}
      />
    </>
  );
}
