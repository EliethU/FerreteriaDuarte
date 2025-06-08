// 1. Importaciones necesarias
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { Button, Form, ListGroup, Spinner, Modal } from "react-bootstrap";

// 2. Definición del componente principal
const ChatIA = ({ showChatModal, setShowChatModal }) => {
  // 3. Variables de estado
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [intencion, setIntencion] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  // 4. Referencias a colecciones de Firebase
  const chatCollection = collection(db, "chat");
  const categoriasCollection = collection(db, "categorias");

  // 5. Carga de mensajes en tiempo real
  useEffect(() => {
    const q = query(chatCollection, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mensajesObtenidos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMensajes(mensajesObtenidos);
    });

    return () => unsubscribe();
  }, []);

  // 6. Obtener categorías desde Firebase
  const obtenerCategorias = async () => {
    const snapshot = await getDocs(categoriasCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  // 7. Obtener respuesta de IA desde la API Gemini
  const obtenerRespuestaIA = async (promptUsuario) => {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    const prompt = `
      Analiza el mensaje del usuario: "${promptUsuario}".
      Determina la intención del usuario respecto a operaciones con categorías...`;
    // Aquí vendría la solicitud HTTP a la API de Gemini y su retorno
    // return response.data;
  };

  // 8. Función principal para enviar mensaje y procesar respuesta IA
  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    const nuevoMensaje = {
      texto: mensaje,
      emisor: "usuario",
      timestamp: new Date(),
    };

    setCargando(true);
    setMensaje("");

    try {
      await addDoc(chatCollection, nuevoMensaje);
      const respuestaIA = await obtenerRespuestaIA(mensaje);
      const categorias = await obtenerCategorias();

      // [ ...lógica según la intención: listar, crear, eliminar, actualizar... ]

    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      await addDoc(chatCollection, {
        texto: "Ocurrió un error. Intenta más tarde.",
        emisor: "ia",
        timestamp: new Date(),
      });
    } finally {
      setCargando(false);
    }
  };

  // Renderizar UI (puedes completarlo con Modal, Formulario, etc.)
  return (
    <Modal show={showChatModal} onHide={() => setShowChatModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Asistente IA</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup>
          {mensajes.map((msg) => (
            <ListGroup.Item key={msg.id} variant={msg.emisor === "ia" ? "light" : "primary"}>
              <strong>{msg.emisor === "ia" ? "IA" : "Tú"}:</strong> {msg.texto}
            </ListGroup.Item>
          ))}
        </ListGroup>
        <Form.Control
          type="text"
          value={mensaje}
          placeholder="Escribe tu mensaje..."
          onChange={(e) => setMensaje(e.target.value)}
          disabled={cargando}
        />
        <Button onClick={enviarMensaje} disabled={cargando}>
          {cargando ? <Spinner size="sm" /> : "Enviar"}
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default ChatIA;
