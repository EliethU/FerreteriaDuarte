// Importaciones CORRECTAS:
import { useState, useEffect } from "react"; // Los hooks de React vienen de aquí
import { useNavigate } from "react-router-dom"; // useNavigate sí viene de react-router-dom
import Button from "react-bootstrap/Button";
import ModalInstalacionIOS from "../components/inicio/ModalInstalacionIOS";

const Inicio = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Estados correctamente importados desde react
  const [solicitudInstalacion, setSolicitudInstalacion] = useState(null);
  const [mostrarBotonInstalacion, setMostrarBotonInstalacion] = useState(false);
  const [esDispositivoIOS, setEsDispositivoIOS] = useState(false);
  const [mostrarModalInstrucciones, setMostrarModalInstrucciones] = useState(false);

  useEffect(() => {
    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setEsDispositivoIOS(esIOS);
  }, []);

  useEffect(() => {
    const manejarSolicitudInstalacion = (evento) => {
      evento.preventDefault();
      setSolicitudInstalacion(evento);
      setMostrarBotonInstalacion(true);
    };

    window.addEventListener("beforeinstallprompt", manejarSolicitudInstalacion);

    return () => {
      window.removeEventListener("beforeinstallprompt", manejarSolicitudInstalacion);
    };
  }, []);

  const instalacion = async () => {
    if (!solicitudInstalacion) return;

    try {
      await solicitudInstalacion.prompt();
      const outcome = await solicitudInstalacion.userChoice;
      console.log(outcome === "accepted" ? "Instalación aceptada" : "Instalación rechazada");
    } catch (error) {
      console.error("Error al intentar instalar la PWA:", error);
    } finally {
      setSolicitudInstalacion(null);
      setMostrarBotonInstalacion(false);
    }
  };

  const abrirModalInstrucciones = () => setMostrarModalInstrucciones(true);
  const cerrarModalInstrucciones = () => setMostrarModalInstrucciones(false);

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

      {/* Botón para instalar en Android / navegadores compatibles */}
      {!esDispositivoIOS && mostrarBotonInstalacion && (
        <div className="my-4">
          <Button className="sombra" variant="primary" onClick={instalacion}>
            Instalar app Ferretería Selva <i className="bi bi-download"></i>
          </Button>
        </div>
      )}

      {/* Botón para mostrar instrucciones de instalación en iOS */}
      {esDispositivoIOS && (
        <div className="text-center my-4">
          <Button className="sombra" variant="primary" onClick={abrirModalInstrucciones}>
            Cómo instalar Ferretería Selva en iPhone <i className="bi bi-phone"></i>
          </Button>
        </div>
      )}

      {/* Modal de instrucciones para iOS */}
      <ModalInstalacionIOS
        mostrar={mostrarModalInstrucciones}
        cerrar={cerrarModalInstrucciones}
      />
    </div>
  );
};

export default Inicio;