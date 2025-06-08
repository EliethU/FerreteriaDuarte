// Importaciones
import React, { useState, useEffect } from "react";
import { Container, Button, Col } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import TablaProductos from "../components/productos/TablaProductos";
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import Paginacion from "../components/ordenamiento/Paginacion";

const Productos = () => {
  // Estados para manejo de datos
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    categoria: "",
    imagen: ""
  });
  const [productoEditado, setProductoEditado] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Referencia a las colecciones en Firestore
  const productosCollection = collection(db, "productos");
  const categoriasCollection = collection(db, "categorias");

  // Función para obtener todas las categorías y productos de Firestore
  const fetchData = async () => {
    try {
      // Obtener productos
      const productosData = await getDocs(productosCollection);
      const fetchedProductos = productosData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setProductos(fetchedProductos);

      // Obtener categorías
      const categoriasData = await getDocs(categoriasCollection);
      const fetchedCategorias = categoriasData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCategorias(fetchedCategorias);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  // Hook useEffect para carga inicial de datos
  useEffect(() => {
    fetchData();
  }, []);

  // Manejador de cambios en inputs del formulario de nuevo producto
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  // Manejador de cambios en inputs del formulario de edición
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setProductoEditado((prev) => ({ ...prev, [name]: value }));
  };

  // Manejador para la carga de imágenes
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevoProducto((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductoEditado((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para agregar un nuevo producto (CREATE)
  const handleAddProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.categoria) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }
    try {
      await addDoc(productosCollection, nuevoProducto);
      setShowModal(false);
      setNuevoProducto({ nombre: "", precio: "", categoria: "", imagen: "" });
      await fetchData();
    } catch (error) {
      console.error("Error al agregar producto:", error);
    }
  };

  // Función para actualizar un producto existente (UPDATE)
  const handleEditProducto = async () => {
    if (!productoEditado.nombre || !productoEditado.precio || !productoEditado.categoria) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }
    try {
      const productoRef = doc(db, "productos", productoEditado.id);
      await updateDoc(productoRef, productoEditado);
      setShowEditModal(false);
      await fetchData();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  // Función para eliminar un producto (DELETE)
  const handleDeleteProducto = async () => {
    if (productoAEliminar) {
      try {
        const productoRef = doc(db, "productos", productoAEliminar.id);
        await deleteDoc(productoRef);
        setShowDeleteModal(false);
        await fetchData();
      } catch (error) {
        console.error("Error al eliminar producto:", error);
      }
    }
  };

  // Método para copiar datos de una fila al portapapeles
  const handleCopy = (producto) => {
    const texto = `Nombre: ${producto.nombre}, Precio: C$${producto.precio}, Categoría: ${producto.categoria}`;
    navigator.clipboard.writeText(texto)
      .then(() => alert("Producto copiado al portapapeles"))
      .catch((err) => alert("Error al copiar"));
  };

  // Función para abrir el modal de edición con datos prellenados
  const openEditModal = (producto) => {
    setProductoEditado({ ...producto });
    setShowEditModal(true);
  };

  // Función para abrir el modal de eliminación
  const openDeleteModal = (producto) => {
    setProductoAEliminar(producto);
    setShowDeleteModal(true);
  };

  const paginatedProductos = productos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Generar PDF
 // Método para generar PDF CORREGIDO
const generarPDFProductos = () => {
  // Crear documento
  const doc = new jsPDF();
  
  // Configurar encabezado con rectángulo y título
  doc.setFillColor(28, 41, 51);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
  
  // Título centrado con texto blanco
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text(
    "Lista de Productos", 
    doc.internal.pageSize.getWidth() / 2, 
    18, 
    { align: "center" }
  );

  // Definir columnas y filas
  const columns = ["#", "Nombre", "Precio", "Categoría"];
  const rows = productos.map((producto, index) => [
    index + 1,
    producto.nombre,
    `C$ ${producto.precio}`,
    producto.categoria,
  ]);

  // Configuración de la tabla
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 48,
    theme: 'grid',
    styles: { 
      fontSize: 10, 
      cellPadding: 2,
      textColor: [0, 0, 0] // Color negro para el texto
    },
    headStyles: {
      fillColor: [28, 41, 51], // Mismo color que el encabezado
      textColor: [255, 255, 255] // Texto blanco en encabezado
    },
    margin: { top: 20, left: 14, right: 16 },
    tableWidth: 'auto',
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 'auto' }
    },
    didDrawPage: function (data) {
      // Pie de página con número de página
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }
  });

  // Guardar PDF con nombre basado en fecha
  const fecha = new Date();
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  const nombreArchivo = `productos_${dia}${mes}${anio}.pdf`;

  doc.save(nombreArchivo);
};

  // Generar Excel
  const exportarExcelProductos = () => {
    // Definir estructura de datos
    const datos = [
      ["#", "Nombre", "Precio", "Categoría"],
      ...productos.map((producto, index) => [
        index + 1,
        producto.nombre,
        `C$ ${producto.precio}`,
        producto.categoria
      ])
    ];

    // Crear hoja y libro
    const hoja = XLSX.utils.aoa_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Productos");

    // Generar archivo binario
    const excelBuffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });

    // Configurar nombre basado en fecha
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const nombreArchivo = `Productos_${dia}${mes}${anio}.xlsx`;

    // Guardar archivo
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, nombreArchivo);
  };

  // Renderizado del componente
  return (
    <Container className="mt-5">
      <br />
      <h4>Gestión de Productos</h4>
      <div className="d-flex flex-wrap gap-3 mb-3">
        <Button onClick={() => setShowModal(true)}>
          Agregar producto
        </Button>
        <Button 
          onClick={generarPDFProductos} 
          variant="secondary"
        >
          Generar PDF
        </Button>
        <Button 
          onClick={exportarExcelProductos} 
          variant="success"
        >
          Generar Excel
        </Button>
      </div>
      
      <TablaProductos
        productos={paginatedProductos}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
        handleCopy={handleCopy}
      />
      
      <Paginacion
        itemsPerPage={itemsPerPage}
        totalItems={productos.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      
      <ModalRegistroProducto
        showModal={showModal}
        setShowModal={setShowModal}
        nuevoProducto={nuevoProducto}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        handleAddProducto={handleAddProducto}
        categorias={categorias}
      />
      
      <ModalEdicionProducto
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        productoEditado={productoEditado}
        handleEditInputChange={handleEditInputChange}
        handleEditImageChange={handleEditImageChange}
        handleEditProducto={handleEditProducto}
        categorias={categorias}
      />
      
      <ModalEliminacionProducto
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDeleteProducto={handleDeleteProducto}
      />
    </Container>
  );
};

export default Productos;