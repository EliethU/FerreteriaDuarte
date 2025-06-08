import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import NavDropdown from "react-bootstrap/NavDropdown";
import logo from "../../assets/react.svg";
import { useAuth } from "../database/authcontext";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useTranslation } from 'react-i18next';
import '../../../src/App.css';

const Encabezado = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    try {
      setIsCollapsed(false);
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminPassword");
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleToggle = () => setIsCollapsed(!isCollapsed);

  const handleNavigate = (path) => {
    navigate(path);
    setIsCollapsed(false);
  };

  const cambiarIdioma = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Navbar expand="sm" fixed="top" className="color-navbar">
      <Container>
        <Navbar.Brand 
          onClick={() => handleNavigate("/inicio")} 
          className="text-black d-flex align-items-center" 
          style={{ cursor: "pointer" }}
        >
          <img alt="" src={logo} width="30" height="30" className="d-inline-block align-top me-2" />
          <strong>Ferreteria Duarte</strong>
        </Navbar.Brand>
        
        <Navbar.Toggle 
          aria-controls="offcanvasNavbar-expand-sm" 
          onClick={handleToggle} 
        />
        
        <Navbar.Offcanvas
          id="offcanvasNavbar-expand-sm"
          aria-labelledby="offcanvasNavbarLabel-expand-sm"
          placement="end"
          show={isCollapsed}
          onHide={() => setIsCollapsed(false)}
        >
          <Offcanvas.Header closeButton className="bg-dark">
            <Offcanvas.Title id="offcanvasNavbarLabel-expand-sm" className="text-white">
              Menú
            </Offcanvas.Title>
          </Offcanvas.Header>
          
          <Offcanvas.Body className="bg-dark">
            <Nav className="justify-content-end flex-grow-1 pe-3">
              {/* Menú items simplificados */}
              {[
                { path: "/inicio", icon: "bi-house-door-fill", text: t('menu.inicio') },
                { path: "/categorias", icon: "bi-tags-fill", text: t('menu.categorias') },
                { path: "/productos", icon: "bi-box-seam-fill", text: t('menu.productos') },
                { path: "/catalogo", icon: "bi-collection-fill", text: t('menu.catalogo') },
                { path: "/clima", icon: "bi-cloud-sun-fill", text: t('menu.clima') },
                { path: "/pronunciacion", icon: "bi-mic-fill", text: t('menu.pronunciacion') },
                { path: "/estadisticas", icon: "bi-graph-up", text: t('menu.estadisticas') },
                { path: "/empleado", icon: "bi-people-fill", text: t('menu.empleado') }
              ].map((item) => (
                <Nav.Link
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className="text-white d-flex align-items-center py-2"
                >
                  {isCollapsed && <i className={`bi ${item.icon} me-2`}></i>}
                  {item.text}
                </Nav.Link>
              ))}

              {/* Login/Logout */}
              {isLoggedIn ? (
                <Nav.Link 
                  onClick={handleLogout} 
                  className="text-white d-flex align-items-center py-2"
                >
                  {isCollapsed && <i className="bi-box-arrow-right me-2"></i>}
                  {t('menu.cerrarSesion')}
                </Nav.Link>
              ) : location.pathname === "/" && (
                <Nav.Link
                  onClick={() => handleNavigate("/")}
                  className="text-white d-flex align-items-center py-2"
                >
                  {isCollapsed && <i className="bi-box-arrow-in-right me-2"></i>}
                  {t('menu.iniciarSesion')}
                </Nav.Link>
              )}

              {/* Selector de idioma */}
              <NavDropdown
                title={
                  <span className="d-flex align-items-center text-white">
                    <i className="bi-translate me-2"></i>
                    {isCollapsed && <span>{t('menu.idioma')}</span>}
                  </span>
                }
                id="language-dropdown"
                menuVariant="dark"
                align="end"
              >
                <NavDropdown.Item onClick={() => cambiarIdioma('es')}>
                  <span className="d-flex align-items-center">
                    <i className="bi-flag me-2"></i>
                    <strong>{t('menu.español')}</strong>
                  </span>
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => cambiarIdioma('en')}>
                  <span className="d-flex align-items-center">
                    <i className="bi-flag me-2"></i>
                    <strong>{t('menu.ingles')}</strong>
                  </span>
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default Encabezado;