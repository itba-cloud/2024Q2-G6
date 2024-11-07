import Link from 'next/link'
import SearchBar from './SearchBar'
import { LOGIN_URL } from 'src/constants'
import { MoonIcon, SunIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"



export default function Navbar({ logoutFun, isLogged }) {
  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-primary">PickItUp</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-foreground hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-sm font-medium">Products</Link>
                <Link href="/about" className="text-foreground hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-sm font-medium">About</Link>
                <Link href="/admin" className="text-foreground hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-sm font-medium">Admin</Link>
                <Link href="/contact" className="text-foreground hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-sm font-medium">Contact</Link>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {/* <ThemeToggle /> */}
            {isLogged ? (
              <Button onClick={logoutFun} variant="outline" className="text-foreground border-foreground hover:bg-accent hover:text-accent-foreground">
                Logout
              </Button>
            ) : (
              <Link href={LOGIN_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="text-foreground border-foreground hover:bg-accent hover:text-accent-foreground">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}