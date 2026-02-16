import catIcon from '../assets/cat.svg'
import loveLetterIcon from '../assets/love-letter-opened.svg'
import heartIcon from '../assets/heart.svg'
import editIcon from '../assets/edit.svg'

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-gray-400 py-3 text-sm grid grid-cols-4 items-center">
      <div className="flex justify-center">
        <img src={catIcon} className="h-9" alt="Search" />
      </div>
      <div className="flex justify-center">
        <img src={loveLetterIcon} className="h-7" alt="Messages" />
      </div>
      <div className="flex justify-center">
        <img src={heartIcon} className="h-7" alt="Likes" />
      </div>
      <div className="flex justify-center">
        <img src={editIcon} className="h-7" alt="Profile" />
      </div>
    </footer>
  )
}
