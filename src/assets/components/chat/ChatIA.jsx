import React, { useEffect, useState } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

const ChatIA = ({ showChatModal, setShowChatModal }) => {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const chatCollection = collection(db, "chat");

  useEffect(() => {
    const q = query(chatCollection, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMensajes(snapshot.docs.map((doc) => doc.data()));
    });
    return () => unsubscribe();
  }, []);

  const obtenerRespuestaIA = async (textoUsuario) => {
  try {
    const respuesta = await fetch(
      "https://generativelanguage.googleapis.com/v1beta3/models/chat-bison-001:generateMessage?key=" + import.meta.env.VITE_GOOGLE_AI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "chat-bison-001",  // Especificamos el modelo
          messages: [
            { role: "user", content: textoUsuario }  // Establecemos el rol del mensaje
          ],
        }),
      }
    );

    // Verificar si la respuesta fue exitosa
    if (!respuesta.ok) {
      console.error("Error en la solicitud, código:", respuesta.status);
      const errorDetails = await respuesta.text();
      console.error("Detalles del error:", errorDetails);
      return "Error al contactar la IA";
    }

    const datos = await respuesta.json();
    console.log("Respuesta de la API:", datos);

    return datos.candidates?.[0]?.content || "No se obtuvo respuesta";
  } catch (error) {
    console.error("Error al contactar la IA:", error);
    return "Error al contactar la IA";
  }
};


  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    setCargando(true);

    await addDoc(chatCollection, {
      texto: mensaje,
      emisor: "usuario",
      timestamp: serverTimestamp(),
    });

    const respuestaIA = await obtenerRespuestaIA(mensaje);

    await addDoc(chatCollection, {
      texto: respuestaIA,
      emisor: "ia",
      timestamp: serverTimestamp(),
    });

    setMensaje("");
    setCargando(false);
  };

  return (
    showChatModal && (
      <div className="modal-overlay">
        <div className="chat-modal">
          <h2>Asistente Inteligente</h2>
          <div className="mensajes">
            {mensajes.map((m, i) => (
              <div key={i} className={m.emisor === "usuario" ? "mensaje usuario" : "mensaje ia"}>
                <strong>{m.emisor === "usuario" ? "Tú" : "IA"}:</strong> {m.texto}
              </div>
            ))}
          </div>
          <div className="entrada-mensaje">
            <input
              type="text"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe tu mensaje..."
            />
            <button onClick={enviarMensaje} disabled={cargando}>
              {cargando ? "Enviando..." : "Enviar"}
            </button>
          </div>
          <button onClick={() => setShowChatModal(false)}>Cerrar</button>
        </div>
      </div>
    )
  );
};

export default ChatIA;
