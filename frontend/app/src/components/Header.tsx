import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-slate-950 text-white px-5 py-3 flex items-center justify-between font-jaini">
      <Link to="/">
        <h1 className="text-3xl font-bold"> Matcha(t)</h1>
      </Link>
    </header>
  )
}
