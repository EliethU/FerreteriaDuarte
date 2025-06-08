import { Card, Col } from "react-bootstrap";
import { Zoom } from "react-awesome-reveal";

const TarjetaProducto = ({ producto }) => {
  return (
    <Col lg={3} md={4} sm={12} className="mb-4">
      <Zoom 
        triggerOnce // La animación solo se ejecuta una vez
        cascade // Efecto en cascada si hay múltiples tarjetas
        duration={500} // Duración de la animación en ms
        delay={100} // Retraso antes de que comience la animación
        damping={0.2} // Reduce la intensidad del efecto
      >
        <Card className="h-100 shadow-sm">
          {producto.imagen && (
            <Card.Img 
              variant="top" 
              src={producto.imagen} 
              alt={producto.nombre}
              style={{ height: "200px", objectFit: "cover" }}
            />
          )}
          <Card.Body className="d-flex flex-column">
            <Card.Title className="text-truncate">{producto.nombre}</Card.Title>
            <Card.Text className="mt-auto">
              <strong>Precio:</strong> C${producto.precio} <br />
              <strong>Categoría:</strong> {producto.categoria}
            </Card.Text>
          </Card.Body>
        </Card>
      </Zoom>
    </Col>
  );
};

export default TarjetaProducto;