import { Link } from 'react-router-dom'
import logo from '../../assets/tobra_logo_2.png'

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2 font-display">
      <div className="text-2xl font-bold text-primary">
        <img src={logo} alt="Tobra logo" className="h-10 w-auto" />
      </div>
    </Link>
  )
}
export default Logo;