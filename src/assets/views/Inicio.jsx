import { useNavigate } from "react-router-dom";

const Inicio = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="margen-superior-main">
      <h1>Inicio</h1>
      <button
        className="boton-inicio"
        onClick={() => handleNavigate("/categorias")}
      >
        Ir a Categorías
      </button>
      <button
        className="boton-inicio"
        onClick={() => handleNavigate("/productos")}
      >
        Ir a Productos
      </button>
      <button
        className="boton-inicio"
        onClick={() => handleNavigate("/catalogo")}
      >
        Ir a Catálogo
      </button>
    </div>
  );
};

export default Inicio;
