"use client";

import type React from "react";
import { useState, useRef } from "react";
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
  ArrowRightIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
} from "../icons/Icons";

interface CustomPerfume {
  id: string;
  name: string;
  isCustom: boolean;
}

type SurveyStep = "intro" | "selection" | "complete";

const PerfumeSurvey: React.FC = () => {
  const [step, setStep] = useState<SurveyStep>("intro");
  const [selectedPerfumes, setSelectedPerfumes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [customPerfumes, setCustomPerfumes] = useState<CustomPerfume[]>([]);
  const [newCustomPerfume, setNewCustomPerfume] = useState<string>("");
  const [wouldBuyDecants, setWouldBuyDecants] = useState<boolean | null>(null);
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);
  const isMobile = useMobile();
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Manejar selección de perfume
  const handleSelectPerfume = (id: string) => {
    if (selectedPerfumes.includes(id)) {
      // Si ya está seleccionado, quitarlo
      setSelectedPerfumes(
        selectedPerfumes.filter((perfumeId) => perfumeId !== id)
      );
    } else {
      // Si no está seleccionado y hay menos de 3, añadirlo
      if (selectedPerfumes.length < 3) {
        setSelectedPerfumes([...selectedPerfumes, id]);
      } else {
        // Si ya hay 3 seleccionados, reemplazar el último
        const newSelection = [...selectedPerfumes];
        newSelection.pop();
        newSelection.push(id);
        setSelectedPerfumes(newSelection);

        // Mostrar notificación
        showNotification("Se ha reemplazado el último perfume seleccionado");
      }
    }
  };

  // Añadir perfume personalizado
  const handleAddCustomPerfume = () => {
    if (newCustomPerfume.trim()) {
      const customId = `custom-${Date.now()}`;
      const newPerfume: CustomPerfume = {
        id: customId,
        name: newCustomPerfume.trim(),
        isCustom: true,
      };

      setCustomPerfumes([...customPerfumes, newPerfume]);

      // Seleccionar automáticamente, reemplazando si es necesario
      if (selectedPerfumes.length < 3) {
        setSelectedPerfumes([...selectedPerfumes, customId]);
      } else {
        const newSelection = [...selectedPerfumes];
        newSelection.pop();
        newSelection.push(customId);
        setSelectedPerfumes(newSelection);
        showNotification("Se ha reemplazado el último perfume seleccionado");
      }

      setNewCustomPerfume("");
      setShowAddCustom(false);
      setSearchQuery("");

      showNotification("¡Perfume añadido correctamente!");
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
    }, 2000);
  };

  // Iniciar la encuesta
  const handleStartSelection = (buyDecants: boolean) => {
    setWouldBuyDecants(buyDecants);
    setStep("selection");
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

    const newOrder = [...selectedPerfumes];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    setSelectedPerfumes(newOrder);
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

  return (
    <div className="container survey-container" ref={scrollRef}>
      <header className="survey-header">
        <h1 className="survey-title">Encuesta de Perfumes</h1>
        <p className="survey-subtitle">Selecciona tus perfumes favoritos</p>
      </header>

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
          {/* Barra de progreso */}
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, (selectedPerfumes.length / 3) * 100)}%`,
              }}
            ></div>
            <span className="progress-text">
              {selectedPerfumes.length}/3 perfumes seleccionados
            </span>
          </div>

          {/* Sección de búsqueda simplificada */}
          <div className="search-section">
            <div className="search-container">
              <SearchIcon size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar perfume o añadir uno nuevo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <div className="search-actions">
                  <button
                    className="search-clear-button"
                    onClick={() => setSearchQuery("")}
                  >
                    <XIcon size={20} />
                  </button>
                  {searchQuery.length > 2 && (
                    <button
                      className="search-add-button"
                      onClick={() => {
                        setNewCustomPerfume(searchQuery);
                        handleAddCustomPerfume();
                      }}
                      title="Añadir este perfume a la lista"
                    >
                      <PlusIcon size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mensaje cuando no hay resultados - Simplificado */}
          {noResults && (
            <div className="no-results">
              <div className="no-results-content">
                <p className="no-results-title">
                  ¿No encuentras "{searchQuery}"?
                </p>
                <button
                  className="no-results-add-button"
                  onClick={() => {
                    setNewCustomPerfume(searchQuery);
                    handleAddCustomPerfume();
                  }}
                >
                  <PlusIcon size={16} />
                  <span>Añadir a mis perfumes</span>
                </button>
              </div>
            </div>
          )}

          {/* Perfumes seleccionados */}
          {selectedPerfumes.length > 0 && (
            <div className="selected-perfumes">
              <h3 className="selected-title">
                Tus perfumes seleccionados:
                <span className="selected-subtitle">
                  (Arrastra para reordenar)
                </span>
              </h3>
              <div className="selected-list">
                {selectedPerfumes.map((id, index) => {
                  const details = getPerfumeDetails(id);
                  return (
                    <div key={id} className="selected-item" draggable={true}>
                      <div className="selected-rank">{index + 1}</div>
                      <div className="selected-image">
                        {id.startsWith("custom-") ? (
                          <div className="selected-custom-icon">
                            <PlusIcon size={20} />
                          </div>
                        ) : (
                          <img
                            src={details.image || "/placeholder.svg"}
                            alt={details.name}
                          />
                        )}
                      </div>
                      <div className="selected-info">
                        <p className="selected-name">{details.name}</p>
                        <p className="selected-brand">{details.brand}</p>
                      </div>
                      <div className="selected-actions">
                        <button
                          className="selected-move-button"
                          onClick={() => handleMovePerfume(index, index - 1)}
                          disabled={index === 0}
                          aria-label="Mover hacia arriba"
                        >
                          <ChevronRightIcon className="rotate-270" size={18} />
                        </button>
                        <button
                          className="selected-move-button"
                          onClick={() => handleMovePerfume(index, index + 1)}
                          disabled={index === selectedPerfumes.length - 1}
                          aria-label="Mover hacia abajo"
                        >
                          <ChevronRightIcon className="rotate-90" size={18} />
                        </button>
                        <button
                          className="selected-remove-button"
                          onClick={() =>
                            setSelectedPerfumes(
                              selectedPerfumes.filter((_, i) => i !== index)
                            )
                          }
                          aria-label="Eliminar"
                        >
                          <XIcon size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Carruseles de perfumes por marca */}
          <div className="perfumes-by-brand">
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
                      >
                        <ChevronLeftIcon size={16} />
                      </button>
                      <button
                        className="brand-nav-button"
                        onClick={() => scrollCarousel(brandId, "right")}
                        aria-label="Desplazar a la derecha"
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
                            className={`perfume-card ${
                              isSelected ? "perfume-card-selected" : ""
                            }`}
                            onClick={() => handleSelectPerfume(perfume.id)}
                          >
                            <div className="perfume-image-container">
                              <img
                                src={perfume.image || "/placeholder.svg"}
                                alt={perfume.name}
                                className="perfume-image"
                              />
                              {isSelected && (
                                <div className="perfume-selected-badge">
                                  <span>{selectionIndex + 1}</span>
                                </div>
                              )}
                            </div>
                            <div className="perfume-info">
                              <p className="perfume-name">{perfume.name}</p>
                            </div>
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
                <h3 className="brand-title">Perfumes personalizados</h3>
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
                        className={`perfume-card ${
                          isSelected ? "perfume-card-selected" : ""
                        }`}
                        onClick={() => handleSelectPerfume(perfume.id)}
                      >
                        <div className="perfume-image-container">
                          <div className="custom-perfume-icon">
                            <PlusIcon size={24} />
                          </div>
                          {isSelected && (
                            <div className="perfume-selected-badge">
                              <span>{selectionIndex + 1}</span>
                            </div>
                          )}
                        </div>
                        <div className="perfume-info">
                          <p className="perfume-name">{perfume.name}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botón para enviar */}
          <div className="floating-button-container">
            <button
              className={`floating-button ${
                selectedPerfumes.length === 3 ? "floating-button-ready" : ""
              }`}
              onClick={handleSubmit}
              disabled={selectedPerfumes.length < 1}
            >
              {selectedPerfumes.length === 0
                ? "Selecciona al menos un perfume"
                : selectedPerfumes.length < 3
                ? `Enviar selección (${selectedPerfumes.length}/3)`
                : "Enviar selección"}
              <ArrowRightIcon size={20} className="floating-button-icon" />
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

          <button
            className="restart-button"
            onClick={() => {
              setSelectedPerfumes([]);
              setCustomPerfumes([]);
              setSearchQuery("");
              setStep("intro");
            }}
          >
            Realizar otra encuesta
          </button>
        </div>
      )}
    </div>
  );
};

export default PerfumeSurvey;
