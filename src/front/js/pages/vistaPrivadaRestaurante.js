import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useParams, useNavigate } from "react-router-dom";
import UploadImageCloudinary from "../component/uploadImageCloudinary";
import "../../styles/vistaPrivadaRestaurante.css";

export const VistaPrivadaRestaurante = () => {
  const { store, actions } = useContext(Context);
  const { restaurante_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [restaurante, setRestaurante] = useState(store.restaurantDetails);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  console.log(showPasswordModal);

  useEffect(() => {
    const fetchRestaurante = async () => {
      try {
        setLoading(true);
        const restaurante_api = await actions.getRestaurante(restaurante_id);
        setRestaurante(restaurante_api);
        console.log(restaurante_api);
        await actions.obtenerValoracionRestaurante(restaurante_id);
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener los detalles del restaurante:", err);
        setError("Hubo un error al cargar los datos del restaurante.");
        setLoading(false);
      }
    };

    if (!sessionStorage.getItem("token")) {
      navigate("/");
    } else if (restaurante_id) {
      fetchRestaurante();
    }
  }, []);

  const valoraciones = store.valoraciones;

  if (loading) {
    return <div className="loading-message">Cargando los datos del restaurante...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!restaurante) {
    return <div className="error-message">No se encontraron los detalles del restaurante.</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Función callback que se pasará al componente UploadImageCloudinary
  const handleImageUpload = (url) => {
    // Actualizamos formData con la URL de la imagen subida
    setFormData({
      ...formData,
      image: url
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleUpdateRestaurante = async () => {
    try {
      const response = await actions.modificarDatosRestaurante(restaurante_id, formData);

      if (response.success) {
        setFormData(response.data);

        const restaurantesActualizados = store.restaurantes.map((rest) =>
          rest.id === restaurante_id ? response.data : rest
        );

        setRestaurante({
          ...restaurante,
          ...formData
        });
        console.log({
          ...restaurante,
          ...formData
        });
        alert("Datos del restaurante actualizados correctamente.");
      } else {
        alert("Error al actualizar los datos del restaurante.");
      }
    } catch (error) {
      console.error("Error al actualizar el restaurante", error);
    }
  };

  // Función para enviar la nueva contraseña
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await actions.cambiarContraseña({
        restaurante_id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.success) {
        alert("Contraseña cambiada con éxito");
        setShowPasswordModal(false);
      } else {
        alert(response.message || "Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña", error);
      alert("Error al cambiar la contraseña");
    }
  };

  return (
    <div className="restaurant-private-container">
      <h1 className="restaurant-private-title">{restaurante.nombre}</h1>
      <p className="restaurant-private-info">
        <strong>Dirección:</strong> {restaurante.direccion}
      </p>
      <p className="restaurant-private-info">
        <strong>Nombre del restaurante:</strong> {restaurante.nombre}
      </p>
      <p className="restaurant-private-info">
        <strong>Teléfono:</strong> {restaurante.telefono}
      </p>
      <p className="restaurant-private-info">
        <strong>Cubiertos:</strong> {restaurante.cubiertos}
      </p>
      <p className="restaurant-private-info">
        <strong>Cantidad de mesas:</strong> {restaurante.cantidad_mesas}
      </p>
      <p className="restaurant-private-info">
        <strong>Reservas por día:</strong> {restaurante.reservas_por_dia}
      </p>

      <p className="restaurant-private-info">
        <strong>Horario de mañana:</strong> {restaurante.horario_mañana_inicio} -{" "}
        {restaurante.horario_mañana_fin}
      </p>
      <p className="restaurant-private-info">
        <strong>Horario de tarde:</strong> {restaurante.horario_tarde_inicio} -{" "}
        {restaurante.horario_tarde_fin}
      </p>

      <p className="restaurant-private-info">
        <strong>Favoritos:</strong> {restaurante.favoritos_count || 0} usuarios han añadido este
        restaurante a sus favoritos.
      </p>

      {/* Botón para cambiar la contraseña */}
      <button
        type="button"
        className="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#recuperacion"
      >
        Cambiar contraseña
      </button>

      {/* Modal de cambio de contraseña */}
      <div className="modal fade" id="recuperacion" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cambiar Contraseña</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label">Contraseña actual:</label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="form-control"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nueva contraseña:</label>
                  <input
                    type="password"
                    name="newPassword"
                    className="form-control"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmar nueva contraseña:</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Actualizar Contraseña
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {restaurante.image && (
        <img
          className="restaurant-private-image"
          src={restaurante.image}
          alt={`Imagen de ${restaurante.nombre}`}
        />
      )}

      <div className="restaurant-private-form">
        <h3 className="restaurant-private-form-title">Modifica los datos de tu restaurante:</h3>

        {/* Nombre */}
        <div className="mb-3">
          <label className="form-label" htmlFor="nombre">
            Nombre del restaurante
          </label>
          <input
            className="form-control"
            type="text"
            name="nombre"
            id="nombre"
            defaultValue={restaurante.nombre}
            onChange={handleInputChange}
            placeholder="Nombre del restaurante"
          />
        </div>

        {/* Dirección */}
        <div className="mb-3">
          <label className="form-label" htmlFor="direccion">
            Dirección
          </label>
          <input
            className="form-control"
            type="text"
            name="direccion"
            id="direccion"
            defaultValue={restaurante.direccion}
            onChange={handleInputChange}
            placeholder="Dirección"
          />
        </div>

        {/* Teléfono */}
        <div className="mb-3">
          <label className="form-label" htmlFor="telefono">
            Teléfono
          </label>
          <input
            className="form-control"
            type="text"
            name="telefono"
            id="telefono"
            defaultValue={restaurante.telefono}
            onChange={handleInputChange}
            placeholder="Teléfono"
          />
        </div>

        {/* Cubiertos */}
        <div className="mb-3">
          <label className="form-label" htmlFor="cubiertos">
            Cubiertos
          </label>
          <input
            className="form-control"
            type="text"
            name="cubiertos"
            id="cubiertos"
            defaultValue={restaurante.cubiertos}
            onChange={handleInputChange}
            placeholder="Cubiertos"
          />
        </div>

        {/* Cantidad de mesas */}
        <div className="mb-3">
          <label className="form-label" htmlFor="cantidad_mesas">
            Cantidad de mesas
          </label>
          <input
            className="form-control"
            type="text"
            name="cantidad_mesas"
            id="cantidad_mesas"
            defaultValue={restaurante.cantidad_mesas}
            onChange={handleInputChange}
            placeholder="Cantidad de mesas"
          />
        </div>

        {/* Reservas por día */}
        <div className="mb-3">
          <label className="form-label" htmlFor="reservas_por_dia">
            Reservas por día
          </label>
          <input
            className="form-control"
            type="text"
            name="reservas_por_dia"
            id="reservas_por_dia"
            defaultValue={restaurante.reservas_por_dia}
            onChange={handleInputChange}
            placeholder="Reservas por día"
          />
        </div>

        {/* Componente UploadImageCloudinary */}
        <div className="restaurant-private-image-upload">
          <label className="restaurant-private-label" htmlFor="image"></label>
          <UploadImageCloudinary onImageUpload={handleImageUpload} />
        </div>

        <button className="btn btn-primary w-100" onClick={handleUpdateRestaurante}>
          Guardar y actualizar
        </button>
      </div>

      <div className="restaurant-private-reviews">
        <h3 className="restaurant-private-reviews-title">Valoraciones</h3>
        {valoraciones && valoraciones.length > 0 ? (
          valoraciones.map((valoracion) => (
            <div key={valoracion.id} className="restaurant-private-review">
              <p>
                <strong>Puntuación:</strong> {valoracion.puntuacion}
              </p>
              <p>
                <strong>Comentario:</strong> {valoracion.comentario}
              </p>
            </div>
          ))
        ) : (
          <p className="restaurant-private-no-reviews">No hay valoraciones para este restaurante.</p>
        )}
      </div>
    </div>
  );
};
