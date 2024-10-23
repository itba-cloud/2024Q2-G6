import Link from 'next/link'
import SearchBar from './SearchBar'
import { LOGIN_URL } from 'src/constants'

export default function Navbar({isLogged, logoutFun}) {

    return <header className='bg-secondary font-serif w-full h-12 flex items-center'>
      <Link href={'/'} className='px-2 font-bold'>
      E-commerce System
      </Link>
      <div className="ml-auto mr-3">
        {isLogged ? (
          <button 
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            onClick={logoutFun}
          >
            Log out
          </button>
        ) : (
          <Link href={LOGIN_URL} className="ml-auto">
            <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
              Log in
            </button>
          </Link>
        )}
      </div>
      
    </header>
  }