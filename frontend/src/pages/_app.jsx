import '/src/styles/globals.css'
import '/src/styles/custom.css'
import Navbar from '@components/Navbar'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {REDIRECT_URI, LOGIN_CLIENT_ID, AUTH_URL} from 'src/constants'
import qs from 'qs'
import axios from 'axios';

export default function App({ Component, pageProps }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const router = useRouter();

  const logoutFun = () => {
    setToken(null)
    setIsLoggedIn(false)
    localStorage.setItem('jwtToken', null)
  }

  useEffect(() => {
    // Function to fetch the JWT token using the code from query parameters
    const fetchToken = async (code) => {
      console.log(AUTH_URL)
      console.log(process.env)
        try {
          const response = await axios.post(`${AUTH_URL}`, qs.stringify({
            code,
            client_id: LOGIN_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })
            return response.data.id_token;
        } catch (error) {
            console.error('Error fetching token:', error.response?.data || error.message);
            return null;
        }
    };

    // Extract the code from query parameters
    const { code } = router.query; // Assuming the code is in the query parameters

    if (code) {
        // Fetch the JWT token using the code
        fetchToken(code).then((fetchedToken) => {
            if (fetchedToken) {
                // Persist the token for future requests
                localStorage.setItem('jwtToken', fetchedToken);
                setToken(fetchedToken);
                setIsLoggedIn(true); // Update login state
            }
        });
    } else {
        // Check if the token is already stored
        const storedToken = localStorage.getItem('jwtToken');
        if (storedToken) {
            setToken(storedToken);
            setIsLoggedIn(true); // User is logged in if token exists
        }
    }
}, [router.isReady, router.query]);

  return <div className='w-full bg-primary min-h-screen flex flex-col'>
    <Navbar isLogged={isLoggedIn} logoutFun={logoutFun}/>
    <main className='w-full flex-1 flex'>
    <Component {...pageProps} isLogged={isLoggedIn} />
    </main>
  </div>
}
