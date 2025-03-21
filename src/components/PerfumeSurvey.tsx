"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import "./PerfumeSurvey.css";
import { perfumes, type Perfume } from "../data/perfumeData";
import { useMobile } from "../hooks/useMobile";
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  SearchIcon,
  PlusIcon,
  XIcon,
  InfoIcon,
  ArrowRightIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  HelpCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ListOrderedIcon,
} from "../icons/Icons";

interface CustomPerfume {
  id: string;
  name: string;
  isCustom: boolean;
}

type SurveyStep = "intro" | "selection" | "ranking" | "complete";
type GuideStep =
  | "welcome"
  | "search"
  | "select"
  | "reorder"
  | "submit"
  | "none";

const PerfumeSurvey: React.FC = () => {
  const [step, setStep] = useState<SurveyStep>("intro");
  const [selectedPerfumes, setSelectedPerfumes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [customPerfumes, setCustomPerfumes] = useState<CustomPerfume[]>([]);
  const [newCustomPerfume, setNewCustomPerfume] = useState<string>("");
  const [wouldBuyDecants, setWouldBuyDecants] = useState<boolean | null>(null);
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);
  const [guideStep, setGuideStep] = useState<GuideStep>("welcome");
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const isMobile = useMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const [showTitle, setShowTitle] = useState(true);
  // Agregar estado para el modal flotante
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [modalPerfumeName, setModalPerfumeName] = useState<string>("");

  // Actualizar el paso de guía basado en las acciones del usuario
  useEffect(() => {
    if (step === "selection") {
      if (selectedPerfumes.length === 0) {
        setGuideStep("welcome");
      } else if (selectedPerfumes.length === 1) {
        setGuideStep("select");
      } else if (selectedPerfumes.length >= 2) {
        setGuideStep("reorder");
      }

      if (selectedPerfumes.length === 3) {
        setGuideStep("submit");
      }
    }
  }, [selectedPerfumes.length, step]);

  // Filtrar perfumes basados en la búsqueda
  const filteredPerfumes = perfumes.filter(
    (perfume) =>
      perfume.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perfume.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Agrupar perfumes por marca
  const perfumesByBrand = filteredPerfumes.reduce((acc, perfume) => {
    if (!acc[perfume.brand]) {
      acc[perfume.brand] = [];
    }
    acc[perfume.brand].push(perfume);
    return acc;
  }, {} as Record<string, Perfume[]>);

  // Ordenar marcas alfabéticamente
  const sortedBrands = Object.keys(perfumesByBrand).sort();

  const noResults = searchQuery.length > 0 && filteredPerfumes.length === 0;

  // Modificar la función handleSelectPerfume para evitar el desplazamiento automático
  const handleSelectPerfume = (id: string, event?: React.MouseEvent) => {
    // Si hay un evento, prevenir comportamiento por defecto que podría causar scroll
    if (event) {
      event.preventDefault();
    }

    // Guardar la posición actual del scroll antes de modificar el estado
    scrollPositionRef.current = window.scrollY;

    // Crear efecto visual de clic más sutil
    const addClickEffect = (element: HTMLElement) => {
      // Crear el elemento de efecto
      const ripple = document.createElement("span");
      ripple.className = "ripple-effect";
      element.appendChild(ripple);

      // Calcular posición y tamaño
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.5;

      // Posicionar en el centro para un efecto más sutil
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `50%`;
      ripple.style.top = `50%`;
      ripple.style.transform = `translate(-50%, -50%) scale(0)`;

      // Eliminar después de la animación
      setTimeout(() => {
        ripple.remove();
      }, 400); // Reducir tiempo de animación
    };

    // Encontrar el elemento de la tarjeta y aplicar el efecto
    const cardElement = document.getElementById(`perfume-card-${id}`);
    if (cardElement) {
      addClickEffect(cardElement);
    }

    if (selectedPerfumes.includes(id)) {
      // Si ya está seleccionado, quitarlo
      setSelectedPerfumes(
        selectedPerfumes.filter((perfumeId) => perfumeId !== id)
      );
    } else {
      // Si no está seleccionado y hay menos de 3, añadirlo
      if (selectedPerfumes.length < 3) {
        setSelectedPerfumes([...selectedPerfumes, id]);

        // Mostrar mensaje de guía apropiado
      } else {
        // Si ya hay 3 seleccionados, reemplazar el último
        const newSelection = [...selectedPerfumes];
        newSelection.pop();
        newSelection.push(id);
        setSelectedPerfumes(newSelection);
      }
    }

    // Restaurar la posición del scroll después de que el DOM se actualice
    setTimeout(() => {
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: "auto", // Usar "auto" en lugar de "smooth" para evitar animaciones
      });
    }, 0);
  };

  // Añadir perfume personalizado
  const handleAddCustomPerfume = (customName?: string) => {
    // Usar el parámetro si se proporciona, o usar el estado newCustomPerfume
    const perfumeName = customName || newCustomPerfume;
    if (perfumeName.trim()) {
      // Guardar la posición actual del scroll
      scrollPositionRef.current = window.scrollY;

      const customId = `custom-${Date.now()}`;
      const newPerfume: CustomPerfume = {
        id: customId,
        name: perfumeName.trim(),
        isCustom: true,
      };

      setCustomPerfumes([...customPerfumes, newPerfume]);

      // Seleccionar automáticamente, reemplazando si es necesario
      if (selectedPerfumes.length < 3) {
        setSelectedPerfumes([...selectedPerfumes, customId]);

        // Mostrar mensaje de guía apropiado
        if (selectedPerfumes.length === 0) {
          showNotification("¡Perfume añadido y seleccionado!");
        } else if (selectedPerfumes.length === 1) {
          showNotification("¡Segundo perfume añadido!");
        } else if (selectedPerfumes.length === 2) {
          showNotification("¡Tercer perfume añadido!");
        }
      } else {
        const newSelection = [...selectedPerfumes];
        newSelection.pop();
        newSelection.push(customId);
        setSelectedPerfumes(newSelection);
        showNotification(
          "Se ha añadido y reemplazado el último perfume seleccionado"
        );
      }

      setNewCustomPerfume("");
      setShowAddCustom(false);
      setSearchQuery("");

      // Restaurar la posición del scroll después de que el DOM se actualice
      setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: "auto",
        });
      }, 0);
    }
  };

  // Agregar función para manejar la adición desde el modal
  const handleAddFromModal = () => {
    if (modalPerfumeName.trim()) {
      handleAddCustomPerfume(modalPerfumeName);
      setModalPerfumeName("");
      setShowAddModal(false);
    }
  };

  // Mostrar notificación
  const showNotification = (message: string) => {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span class="toast-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.5s ease";
      setTimeout(() => document.body.removeChild(toast), 500);
    }, 3000);
  };

  // Iniciar la encuesta
  const handleStartSelection = (buyDecants: boolean) => {
    setWouldBuyDecants(buyDecants);
    setStep("selection");

    // Enfocar el campo de búsqueda automáticamente
    setTimeout(() => {
      if (searchRef.current) {
        searchRef.current.focus();
      }
    }, 300);
  };

  // Continuar a la pantalla de clasificación
  const handleContinueToRanking = () => {
    if (selectedPerfumes.length > 0) {
      setStep("ranking");
      // Scroll al inicio de la página
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      showNotification("Selecciona al menos un perfume para continuar");
    }
  };

  // Enviar la encuesta
  const handleSubmit = () => {
    // Preparar los datos para enviar
    const selectedPerfumeData = selectedPerfumes.map((id, index) => {
      const isCustom = id.startsWith("custom-");
      if (isCustom) {
        const customPerfume = customPerfumes.find((p) => p.id === id);
        return {
          rank: index + 1,
          id,
          name: customPerfume?.name || "Perfume personalizado",
          isCustom: true,
        };
      } else {
        const perfume = perfumes.find((p) => p.id === id);
        return {
          rank: index + 1,
          id,
          name: perfume?.name || "",
          brand: perfume?.brand || "",
          isCustom: false,
        };
      }
    });

    // Aquí podrías enviar los datos a un servidor
    console.log("Datos a enviar:", {
      wouldBuyDecants,
      selectedPerfumes: selectedPerfumeData,
    });

    setStep("complete");
  };

  // Obtener detalles de un perfume
  const getPerfumeDetails = (id: string) => {
    if (id.startsWith("custom-")) {
      const customPerfume = customPerfumes.find((p) => p.id === id);
      return {
        name: customPerfume?.name || "Perfume personalizado",
        brand: "Personalizado",
        image: "/placeholder.svg",
      };
    } else {
      const perfume = perfumes.find((p) => p.id === id);
      return {
        name: perfume?.name || "",
        brand: perfume?.brand || "",
        image: perfume?.image || "/placeholder.svg",
      };
    }
  };

  // Mover un perfume en la lista de seleccionados
  const handleMovePerfume = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= selectedPerfumes.length) return;

    // Guardar la posición actual del scroll
    scrollPositionRef.current = window.scrollY;

    const newOrder = [...selectedPerfumes];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    setSelectedPerfumes(newOrder);

    // Restaurar la posición del scroll después de que el DOM se actualice
    setTimeout(() => {
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: "auto",
      });
    }, 0);
  };

  // Función para desplazar el carrusel horizontalmente
  const scrollCarousel = (brandId: string, direction: "left" | "right") => {
    const carousel = document.getElementById(`carousel-${brandId}`);
    if (carousel) {
      const scrollAmount = 200; // Ajustar según sea necesario
      if (direction === "left") {
        carousel.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        carousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  // Renderizar mensaje de guía basado en el paso actual
  const renderGuideMessage = () => {
    switch (guideStep) {
      case "welcome":
        return (
          <div className="guide-message">
            <InfoIcon size={20} className="guide-icon" />
            <div className="guide-text">
              <p>Busca y selecciona hasta 3 de tus perfumes favoritos.</p>
              <p>
                Si no encuentras tu perfume, puedes añadirlo escribiendo su
                nombre.
              </p>
            </div>
          </div>
        );
      case "select":
        return (
          <div className="guide-message">
            <InfoIcon size={20} className="guide-icon" />
            <div className="guide-text">
              <p>
                ¡Buen comienzo! Has seleccionado {selectedPerfumes.length}{" "}
                perfume.
              </p>
              <p>
                Puedes seleccionar hasta 2 perfumes más para completar tu top 3.
              </p>
            </div>
          </div>
        );
      case "reorder":
        return (
          <div className="guide-message">
            <InfoIcon size={20} className="guide-icon" />
            <div className="guide-text">
              <p>Ahora puedes ordenar tus perfumes según tu preferencia.</p>
              <p>
                Usa las flechas para cambiar el orden (1 = favorito, 3 = menos
                favorito).
              </p>
            </div>
          </div>
        );
      case "submit":
        return (
          <div className="guide-message guide-message-success">
            <CheckIcon size={20} className="guide-icon" />
            <div className="guide-text">
              <p>¡Perfecto! Has seleccionado tus 3 perfumes favoritos.</p>
              <p>Haz clic en "Continuar" para clasificarlos del 1 al 3.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Renderizar ayuda contextual
  const renderHelp = () => {
    return (
      <div className={`help-overlay ${showHelp ? "help-visible" : ""}`}>
        <div className="help-content">
          <button className="help-close" onClick={() => setShowHelp(false)}>
            <XIcon size={24} />
          </button>
          <h3 className="help-title">Guía de la encuesta</h3>

          <div className="help-section">
            <h4>¿Cómo seleccionar perfumes?</h4>
            <p>
              Haz clic en cualquier perfume para seleccionarlo. Puedes
              seleccionar hasta 3 perfumes.
            </p>
          </div>

          <div className="help-section">
            <h4>¿No encuentras tu perfume?</h4>
            <p>
              Escribe el nombre en la barra de búsqueda y haz clic en el botón
              "+" para añadirlo.
            </p>
          </div>

          <div className="help-section">
            <h4>¿Cómo cambiar el orden?</h4>
            <p>
              Usa las flechas arriba/abajo junto a cada perfume seleccionado
              para cambiar su posición.
            </p>
          </div>

          <div className="help-section">
            <h4>¿Cómo navegar por los perfumes?</h4>
            <p>
              Usa las flechas izquierda/derecha para desplazarte por los
              perfumes de cada marca.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container survey-container" ref={scrollRef}>
      {showTitle && (
        <header className="survey-header">
          <h1 className="survey-title">Encuesta de Perfumes</h1>
          <p className="survey-subtitle">
            {step === "intro" && "Selecciona tus perfumes favoritos"}
            {step === "selection" && "Selecciona tus perfumes favoritos"}
            {step === "ranking" && "Clasifica tus perfumes del 1 al 3"}
            {step === "complete" && "¡Gracias por tu participación!"}
          </p>

          {(step === "selection" || step === "ranking") && (
            <button
              className="help-button"
              onClick={() => setShowHelp(true)}
              aria-label="Ayuda"
            >
              <HelpCircleIcon size={20} />
            </button>
          )}
        </header>
      )}

      {step === "intro" && (
        <div className="intro-container">
          <div className="intro-card">
            <h2 className="intro-title">
              ¿Comprarías decants de tus perfumes favoritos?
            </h2>

            <p className="intro-description">
              Los decants son pequeñas muestras de perfumes originales que te
              permiten probar diferentes fragancias sin comprar el frasco
              completo.
            </p>

            <div className="intro-buttons">
              <button
                className="intro-button intro-button-yes"
                onClick={() => handleStartSelection(true)}
              >
                <ThumbsUpIcon size={24} />
                <span>Sí, compraría</span>
              </button>

              <button
                className="intro-button intro-button-no"
                onClick={() => handleStartSelection(false)}
              >
                <ThumbsDownIcon size={24} />
                <span>No, no compraría</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "selection" && (
        <div className="selection-container">
          {/* Mensaje de guía */}
          {renderGuideMessage()}

          {/* Sección de búsqueda simplificada */}
          <div className="search-section">
            <div className="search-container">
              <SearchIcon size={20} className="search-icon" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Busca un perfume o escribe uno nuevo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <div className="search-actions">
                  <button
                    className="search-clear-button"
                    onClick={() => setSearchQuery("")}
                    title="Borrar búsqueda"
                  >
                    <XIcon size={20} />
                  </button>
                  {searchQuery.length > 2 && (
                    <button
                      className="search-add-button"
                      onClick={() => handleAddCustomPerfume(searchQuery)}
                      title="Añadir este perfume a la lista"
                    >
                      <PlusIcon size={16} />
                      <span className="search-add-label">Añadir</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="search-hint">
              {searchQuery.length > 0 && searchQuery.length < 3 ? (
                <span>
                  Escribe al menos 3 caracteres para añadir un perfume
                  personalizado
                </span>
              ) : searchQuery.length >= 3 ? (
                <span>
                  Haz clic en <strong>+ Añadir</strong> para crear un perfume
                  personalizado
                </span>
              ) : (
                <span>
                  Escribe para buscar o añadir un perfume que no esté en la
                  lista
                </span>
              )}
            </div>
          </div>

          {/* Mensaje cuando no hay resultados - Simplificado */}
          {noResults && (
            <div className="no-results">
              <div className="no-results-content">
                <p className="no-results-title">
                  No encontramos "{searchQuery}" en nuestra lista
                </p>
                <button
                  className="no-results-add-button"
                  onClick={() => handleAddCustomPerfume(searchQuery)}
                >
                  <PlusIcon size={16} />
                  <span>Añadir a mis perfumes</span>
                </button>
              </div>
            </div>
          )}

          {/* Carruseles de perfumes por marca */}
          <div className="perfumes-by-brand">
            <h3 className="brands-title">Selecciona tus perfumes favoritos:</h3>

            {sortedBrands.map((brand) => {
              const brandId = brand.replace(/\s+/g, "-").toLowerCase();
              return (
                <div key={brand} className="brand-section">
                  <div className="brand-header">
                    <h3 className="brand-title">{brand}</h3>
                    <div className="brand-navigation">
                      <button
                        className="brand-nav-button"
                        onClick={() => scrollCarousel(brandId, "left")}
                        aria-label="Desplazar a la izquierda"
                        title="Ver perfumes anteriores"
                      >
                        <ChevronLeftIcon size={16} />
                      </button>
                      <button
                        className="brand-nav-button"
                        onClick={() => scrollCarousel(brandId, "right")}
                        aria-label="Desplazar a la derecha"
                        title="Ver más perfumes"
                      >
                        <ChevronRightIcon size={16} />
                      </button>
                    </div>
                  </div>

                  <div
                    id={`carousel-${brandId}`}
                    className="brand-carousel hide-scrollbar"
                  >
                    {perfumesByBrand[brand].map((perfume) => {
                      const isSelected = selectedPerfumes.includes(perfume.id);
                      const selectionIndex = selectedPerfumes.indexOf(
                        perfume.id
                      );

                      return (
                        <div
                          key={perfume.id}
                          className="perfume-card-container"
                          style={{ width: isMobile ? "140px" : "160px" }}
                        >
                          <div
                            id={`perfume-card-${perfume.id}`}
                            className={`perfume-card ${
                              isSelected ? "perfume-card-selected" : ""
                            }`}
                            onClick={(e) => handleSelectPerfume(perfume.id, e)}
                          >
                            <div className="perfume-image-container">
                              <img
                                src={perfume.image || "/placeholder.svg"}
                                alt={perfume.name}
                                className="perfume-image"
                              />
                              {isSelected && (
                                <div className="perfume-selected-badge">
                                  <CheckIcon size={12} />
                                </div>
                              )}
                            </div>
                            <div className="perfume-info">
                              <p className="perfume-name">{perfume.name}</p>
                            </div>
                            {isSelected ? (
                              <div className="perfume-action-hint">
                                Clic para deseleccionar
                              </div>
                            ) : (
                              <div className="perfume-action-hint">
                                Clic para seleccionar
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Perfumes personalizados en carrusel */}
          {customPerfumes.length > 0 && (
            <div className="brand-section">
              <div className="brand-header">
                <h3 className="brand-title">Tus perfumes personalizados</h3>
              </div>

              <div className="brand-carousel hide-scrollbar">
                {customPerfumes.map((perfume) => {
                  const isSelected = selectedPerfumes.includes(perfume.id);
                  const selectionIndex = selectedPerfumes.indexOf(perfume.id);

                  return (
                    <div
                      key={perfume.id}
                      className="perfume-card-container"
                      style={{ width: isMobile ? "140px" : "160px" }}
                    >
                      <div
                        id={`perfume-card-${perfume.id}`}
                        className={`perfume-card ${
                          isSelected ? "perfume-card-selected" : ""
                        }`}
                        onClick={(e) => handleSelectPerfume(perfume.id, e)}
                      >
                        <div className="perfume-image-container">
                          <div className="custom-perfume-icon">
                            <PlusIcon size={24} />
                          </div>
                          {isSelected && (
                            <div className="perfume-selected-badge">
                              <CheckIcon size={12} />
                            </div>
                          )}
                        </div>
                        <div className="perfume-info">
                          <p className="perfume-name">{perfume.name}</p>
                        </div>
                        {isSelected ? (
                          <div className="perfume-action-hint">
                            Clic para deseleccionar
                          </div>
                        ) : (
                          <div className="perfume-action-hint">
                            Clic para seleccionar
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botón para continuar a la clasificación */}
          <div className="floating-button-container">
            <button
              className={`floating-button ${
                selectedPerfumes.length > 0 ? "floating-button-ready" : ""
              }`}
              onClick={() => {
                handleContinueToRanking();
                setShowTitle(false);
              }}
              disabled={selectedPerfumes.length === 0}
            >
              {selectedPerfumes.length === 0
                ? "Selecciona al menos un perfume"
                : `Continuar con ${selectedPerfumes.length} perfume${
                    selectedPerfumes.length > 1 ? "s" : ""
                  }`}
              <ArrowRightIcon size={20} className="floating-button-icon" />
            </button>
          </div>
          {step === "selection" && (
            <>
              {/* Botón flotante para añadir perfume - Más descriptivo */}
              <div className="add-perfume-floating-button-container">
                <button
                  className="add-perfume-floating-button"
                  onClick={() => setShowAddModal(true)}
                  aria-label="Añadir perfume personalizado"
                  title="Añadir un perfume que no está en la lista"
                >
                  <PlusIcon size={20} />
                  <span className="add-perfume-button-text">
                    Añadir perfume
                  </span>
                </button>
              </div>

              {/* Modal para añadir perfume */}
              {showAddModal && (
                <div className="add-perfume-modal-overlay">
                  <div className="add-perfume-modal">
                    <button
                      className="add-perfume-modal-close"
                      onClick={() => setShowAddModal(false)}
                    >
                      <XIcon size={20} />
                    </button>
                    <h3 className="add-perfume-modal-title">
                      Añadir perfume personalizado
                    </h3>
                    <div className="add-perfume-modal-content">
                      <input
                        type="text"
                        className="add-perfume-modal-input"
                        placeholder="Nombre del perfume..."
                        value={modalPerfumeName}
                        onChange={(e) => setModalPerfumeName(e.target.value)}
                        autoFocus
                      />
                      <button
                        className="add-perfume-modal-button"
                        onClick={handleAddFromModal}
                        disabled={!modalPerfumeName.trim()}
                      >
                        <PlusIcon size={16} />
                        <span>Añadir perfume</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {step === "ranking" && (
        <div className="ranking-container">
          <div className="ranking-header">
            <div className="ranking-icon">
              <ListOrderedIcon size={32} />
            </div>
            <h2 className="ranking-title">Clasifica tus perfumes favoritos</h2>
            <p className="ranking-subtitle">
              Ordena tus perfumes del 1 al {selectedPerfumes.length}, donde 1 es
              tu favorito absoluto
            </p>
          </div>

          <div className="ranking-instructions">
            <div className="guide-message">
              <InfoIcon size={20} className="guide-icon" />
              <div className="guide-text">
                <p>Ordena los perfumes según tu preferencia.</p>
                <p>
                  También puedes usar los botones de flecha para mover cada
                  perfume hacia arriba o hacia abajo.
                </p>
              </div>
            </div>
          </div>

          <div className="ranking-list">
            {selectedPerfumes.map((id, index) => {
              const details = getPerfumeDetails(id);
              return (
                <div key={id} className="ranking-item">
                  <div className="ranking-position">
                    <div className="ranking-number">{index + 1}</div>
                    {/* <div className="ranking-medal">
                      {index === 0 && (
                        <span className="ranking-medal-gold">🥇</span>
                      )}
                      {index === 1 && (
                        <span className="ranking-medal-silver">🥈</span>
                      )}
                      {index === 2 && (
                        <span className="ranking-medal-bronze">🥉</span>
                      )}
                    </div> */}
                  </div>
                  <div className="ranking-image">
                    {id.startsWith("custom-") ? (
                      <div className="ranking-custom-icon">
                        <PlusIcon size={24} />
                      </div>
                    ) : (
                      <img
                        src={details.image || "/placeholder.svg"}
                        alt={details.name}
                      />
                    )}
                  </div>
                  <div className="ranking-info">
                    <p className="ranking-name">{details.name}</p>
                    <p className="ranking-brand">{details.brand}</p>
                  </div>
                  <div className="ranking-actions">
                    <button
                      className="ranking-move-button"
                      onClick={() => handleMovePerfume(index, index - 1)}
                      disabled={index === 0}
                      aria-label="Mover hacia arriba"
                      title="Mover hacia arriba (mayor preferencia)"
                    >
                      <ArrowUpIcon size={18} />
                    </button>
                    <button
                      className="ranking-move-button"
                      onClick={() => handleMovePerfume(index, index + 1)}
                      disabled={index === selectedPerfumes.length - 1}
                      aria-label="Mover hacia abajo"
                      title="Mover hacia abajo (menor preferencia)"
                    >
                      <ArrowDownIcon size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ranking-actions-container">
            <button
              className="ranking-back-button"
              onClick={() => {
                setStep("selection");
                setShowTitle(true);
              }}
            >
              <ChevronLeftIcon size={20} />
              <span>Volver</span>
            </button>
            <button className="ranking-submit-button" onClick={handleSubmit}>
              <span>Enviar formulario</span>
              <ArrowRightIcon size={20} />
            </button>
          </div>
        </div>
      )}

      {step === "complete" && (
        <div className="complete-container">
          <div className="complete-header">
            <CheckIcon size={48} className="complete-icon" />
            <h2 className="complete-title">
              ¡Gracias por completar la encuesta!
            </h2>
            <p className="complete-subtitle">
              Tus respuestas han sido registradas.
            </p>
          </div>

          <div className="complete-summary">
            <div className="summary-decants">
              <h3 className="summary-question">
                ¿Comprarías decants de tus perfumes favoritos?
              </h3>
              <p className="summary-answer">
                {wouldBuyDecants ? (
                  <>
                    <ThumbsUpIcon size={20} /> Sí, compraría
                  </>
                ) : (
                  <>
                    <ThumbsDownIcon size={20} /> No, no compraría
                  </>
                )}
              </p>
            </div>

            <h3 className="summary-perfumes-title">Tus perfumes favoritos:</h3>
            <div className="summary-perfumes">
              {selectedPerfumes.map((id, index) => {
                const details = getPerfumeDetails(id);
                return (
                  <div key={id} className="summary-perfume">
                    <div className="summary-rank">{index + 1}</div>
                    <div className="summary-image">
                      {id.startsWith("custom-") ? (
                        <div className="summary-custom-icon">
                          <PlusIcon size={20} />
                        </div>
                      ) : (
                        <img
                          src={details.image || "/placeholder.svg"}
                          alt={details.name}
                        />
                      )}
                    </div>
                    <div className="summary-info">
                      <p className="summary-name">{details.name}</p>
                      <p className="summary-brand">{details.brand}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Ayuda contextual */}
      {renderHelp()}
    </div>
  );
};

export default PerfumeSurvey;
