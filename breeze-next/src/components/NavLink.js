import Link from 'next/link'

const NavLink = ({ active = false, children, ...props }) => (
    <Link
        {...props}
        className={`relative inline-flex items-center px-1 pt-1 text-sm font-medium leading-5 focus:outline-none transition duration-150 ease-in-out ${
            active
                ? 'text-gray-900 after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-teal-400 after:to-blue-500 after:content-[""]'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
        }`}>
        {children}
    </Link>
)

export default NavLink
