import { Link } from "react-router-dom"

type AppLogoProps = {
  isLight?: boolean;
  className?: string;
};

function AppLogo({ isLight, className}: AppLogoProps) {
  return (
    <Link to="/" className={`flex items-center font-display ${className || ''}`}>
      <div className="text-3xl font-bold">
        <span className={`${isLight ? "text-white" : "text-black"}`}>Tobra</span>
        <span className="text-red-500">.com</span>
      </div>
    </Link>
  );
}
export default AppLogo