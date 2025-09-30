import { useNavigate } from "react-router-dom";

export default function SearchIcon() {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/recipes");
  }

  return (
    <i
      className="bi bi-search fs-4 text-light mx-3"
      role="button"
      title="Search recipes"
      onClick={handleClick}
    ></i>
  );
}
