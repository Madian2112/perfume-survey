"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import "./PerfumeSurvey.css"
import { perfumes, type Perfume } from "../data/perfumeData"
import { useMobile } from "../hooks/useMobile"
import Button from "./Button"
import Card from "./Card"
import Input from "./Input"
import Tooltip from "./Tooltip"
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  SearchIcon,
  PlusIcon,
  XIcon,
  HandIcon,
  InfoIcon,
  ArrowRightIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
} from "../icons/Icons"

interface CustomPerfume {
  id: string
  name: string
  isCustom: boolean
}

type SurveyStep = "intro" | "selection" | "ranking" | "complete"

const PerfumeSurvey: React.FC = () => {
  const [step, setStep] = useState<SurveyStep>("intro")
  const [selectedPerfumes, setSelectedPerfumes] = useState<string[]>([])
  const [rankedPerfumes, setRankedPerfumes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [customPerfumes, setCustomPerfumes] = useState<CustomPerfume[]>([])
  const [newCustomPerfume, setNewCustomPerfume] = useState<string>("")
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false)
  const [showTutorial, setShowTutorial] = useState<boolean>(true)
  const [wouldBuyDecants, setWouldBuyDecants] = useState<boolean | null>(null)
  const [showSubmitReminder, setShowSubmitReminder] = useState<boolean>(false)
  const isMobile = useMobile()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Agrupar perfumes por marca
  const perfumesByBrand: Record<string, Perfume[]> = perfumes.reduce(
    (acc, perfume) => {
      if (!acc[perfume.brand]) {
        acc[perfume.brand] = []
      }
      acc[perfume.brand].push(perfume)
      return acc
    },
    {} as Record<string, Perfume[]>,
  )

  // Ordenar marcas alfabéticamente
  const sortedBrands = Object.keys(perfumesByBrand).sort()

  // Ocultar el tutorial después de 5 segundos
  useEffect(() => {
    if (showTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showTutorial])

  // Mostrar recordatorio de envío después de 3 segundos en la pantalla de ranking
  useEffect(() => {
    if (step === "ranking") {
      const timer = setTimeout(() => {
        setShowSubmitReminder(true)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setShowSubmitReminder(false)
    }
  }, [step])

  const filteredPerfumes = perfumes.filter(
    (perfume) =>
      perfume.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perfume.brand.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Agrupar perfumes filtrados por marca
  const filteredPerfumesByBrand: Record<string, Perfume[]> = filteredPerfumes.reduce(
    (acc, perfume) => {
      if (!acc[perfume.brand]) {
        acc[perfume.brand] = []
      }
      acc[perfume.brand].push(perfume)
      return acc
    },
    {} as Record<string, Perfume[]>,
  )

  // Ordenar marcas filtradas alfabéticamente
  const filteredBrands = Object.keys(filteredPerfumesByBrand).sort()

  const noResults = searchQuery.length > 0 && filteredPerfumes.length === 0

  const handleSelectPerfume = (id: string) => {
    if (selectedPerfumes.includes(id)) {
      setSelectedPerfumes(selectedPerfumes.filter((perfumeId) => perfumeId !== id))
    } else {
      if (selectedPerfumes.length < 3) {
        setSelectedPerfumes([...selectedPerfumes, id])
      }
    }
    setShowTutorial(false)
  }

  const handleAddCustomPerfume = () => {
    if (newCustomPerfume.trim() && selectedPerfumes.length < 3) {
      const customId = `custom-${Date.now()}`
      const newPerfume: CustomPerfume = {
        id: customId,
        name: newCustomPerfume.trim(),
        isCustom: true,
      }

      setCustomPerfumes([...customPerfumes, newPerfume])
      setSelectedPerfumes([...selectedPerfumes, customId])
      setNewCustomPerfume("")
      setShowCustomInput(false)
      setSearchQuery("")

      // Mostrar un mensaje de confirmación
      const toast = document.createElement("div")
      toast.className = "toast"
      toast.innerHTML = `<span class="toast-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span><span>¡Perfume añadido correctamente!</span>`
      document.body.appendChild(toast)

      setTimeout(() => {
        toast.style.opacity = "0"
        toast.style.transition = "opacity 0.5s ease"
        setTimeout(() => document.body.removeChild(toast), 500)
      }, 2000)
    }
  }

  const handleStartSelection = (buyDecants: boolean) => {
    setWouldBuyDecants(buyDecants)
    setStep("selection")
  }

  const handleStartRanking = () => {
    // Primero, mostrar un indicador de carga
    const loadingElement = document.createElement("div")
    loadingElement.className = "loading-overlay"
    loadingElement.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Preparando el siguiente paso...</p>
      </div>
    `
    document.body.appendChild(loadingElement)

    // Después de un breve retraso, continuar con la transición
    setTimeout(() => {
      document.body.removeChild(loadingElement)
      setRankedPerfumes([...selectedPerfumes])
      setStep("ranking")
    }, 800)
  }

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newRanking = [...rankedPerfumes]
      const temp = newRanking[index]
      newRanking[index] = newRanking[index - 1]
      newRanking[index - 1] = temp
      setRankedPerfumes(newRanking)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < rankedPerfumes.length - 1) {
      const newRanking = [...rankedPerfumes]
      const temp = newRanking[index]
      newRanking[index] = newRanking[index + 1]
      newRanking[index + 1] = temp
      setRankedPerfumes(newRanking)
    }
  }

  interface PerfumeDetails {
    name: string
    brand: string
    image: string
  }

  const handleSubmit = () => {
    // Preparar los datos para enviar
    const selectedPerfumeData = rankedPerfumes.map((id, index) => {
      const isCustom = id.startsWith("custom-")
      if (isCustom) {
        const customPerfume = customPerfumes.find((p) => p.id === id)
        return {
          rank: index + 1,
          id,
          name: customPerfume?.name || "Perfume personalizado",
          isCustom: true,
        }
      } else {
        const perfume = perfumes.find((p) => p.id === id)
        return {
          rank: index + 1,
          id,
          name: perfume?.name || "",
          brand: perfume?.brand || "",
          isCustom: false,
        }
      }
    })

    // Aquí podrías enviar los datos a un servidor
    console.log("Datos a enviar:", {
      wouldBuyDecants,
      selectedPerfumes: selectedPerfumeData,
    })

    setStep("complete")
  }

  const getPerfumeDetails = (id: string): PerfumeDetails => {
    if (id.startsWith("custom-")) {
      const customPerfume = customPerfumes.find((p) => p.id === id)
      return {
        name: customPerfume?.name || "Perfume personalizado",
        brand: "Personalizado",
        image: "/placeholder.svg",
      }
    } else {
      const perfume = perfumes.find((p) => p.id === id)
      return {
        name: perfume?.name || "",
        brand: perfume?.brand || "",
        image: perfume?.image || "/placeholder.svg",
      }
    }
  }

  // Función para desplazar el carrusel horizontalmente
  const scrollCarousel = (brandId: string, direction: "left" | "right") => {
    const carousel = document.getElementById(`carousel-${brandId}`)
    if (carousel) {
      const scrollAmount = 200 // Ajustar según sea necesario
      if (direction === "left") {
        carousel.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        carousel.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  return (
    <div className="container survey-container" ref={scrollRef}>
      <header className="survey-header">
        <h1 className="survey-title">Encuesta de Perfumes</h1>
        <p className="survey-subtitle">Selecciona y clasifica tus perfumes favoritos</p>
      </header>

      {step === "intro" && (
        <div className="intro-container">
          <div className="intro-card">
            <h2 className="intro-title">¿Compraría decants de sus perfumes favoritos?</h2>

            <p className="intro-description">
              Los decants son pequeñas muestras de perfumes originales que te permiten probar diferentes fragancias sin
              comprar el frasco completo.
            </p>

            <div className="intro-note">
              <p>
                <strong>Nota importante:</strong> Tu opinión es valiosa para nosotros. Incluso si no comprarías decants,
                por favor completa esta encuesta para ayudarnos a conocer tus perfumes favoritos.
              </p>
            </div>

            <div className="intro-buttons">
              <Button
                onClick={() => handleStartSelection(true)}
                className="intro-button"
                size="large"
                icon={<ThumbsUpIcon />}
              >
                Sí, compraría
              </Button>

              <Button
                onClick={() => handleStartSelection(false)}
                variant="outline"
                className="intro-button"
                size="large"
                icon={<ThumbsDownIcon />}
              >
                No, no compraría
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "selection" && (
        <div className="selection-container">
          <div className="selection-header">
            <h2 className="selection-title">Selecciona tus 3 perfumes favoritos</h2>
            <span className="selection-counter">{selectedPerfumes.length}/3 seleccionados</span>
          </div>

          {/* Instrucciones claras para el usuario */}
          <div className="selection-instructions">
            <span className="instructions-icon">
              <InfoIcon size={20} />
            </span>
            <div className="instructions-text">
              <p>
                <strong>Paso 1 de 2:</strong> Haz clic en las tarjetas para seleccionar tus 3 perfumes favoritos.
              </p>
              <p>Cuando hayas seleccionado 3 perfumes, haz clic en "Continuar" para ordenarlos según tu preferencia.</p>
            </div>
          </div>

          <div className="search-section">
            <div className="search-container">
              <Input
                type="text"
                placeholder="Buscar o añadir un perfume..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                icon={<SearchIcon size={20} />}
              />
              {searchQuery && (
                <div className="search-actions">
                  {!noResults && (
                    <button className="search-clear-button" onClick={() => setSearchQuery("")}>
                      <XIcon size={20} />
                    </button>
                  )}
                  {searchQuery.length > 2 && (
                    <Tooltip content="Añadir este perfume a la lista">
                      <button
                        className="search-add-button"
                        onClick={() => {
                          setNewCustomPerfume(searchQuery)
                          setShowCustomInput(true)
                        }}
                        disabled={selectedPerfumes.length >= 3}
                      >
                        <PlusIcon size={16} />
                      </button>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>

            {/* Mensaje informativo sobre cómo añadir perfumes */}
            <div className="search-help">
              <span className="search-help-icon">
                <InfoIcon size={16} />
              </span>
              <p>
                Busca un perfume o escribe el nombre y haz clic en{" "}
                <span className="search-help-button">
                  <PlusIcon size={12} />
                </span>{" "}
                para añadir uno personalizado.
              </p>
            </div>
          </div>

          {showCustomInput && (
            <div className="custom-perfume-form">
              <div className="custom-perfume-header">
                <div className="custom-perfume-icon">
                  <PlusIcon size={16} />
                </div>
                <h3 className="custom-perfume-title">Añadir perfume personalizado</h3>
              </div>

              <div className="custom-perfume-inputs">
                <Input
                  type="text"
                  placeholder="Nombre del perfume..."
                  value={newCustomPerfume}
                  onChange={(e) => setNewCustomPerfume(e.target.value)}
                  className="custom-perfume-input"
                  autoFocus
                />

                <div className="custom-perfume-actions">
                  <Button
                    onClick={handleAddCustomPerfume}
                    disabled={!newCustomPerfume.trim() || selectedPerfumes.length >= 3}
                    className="custom-perfume-add-button"
                    icon={<PlusIcon size={16} />}
                  >
                    Añadir a mis perfumes
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowCustomInput(false)
                      setNewCustomPerfume("")
                    }}
                    className="custom-perfume-cancel-button"
                  >
                    <XIcon size={16} />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {noResults && (
            <div className="no-results">
              <div className="no-results-icon">
                <PlusIcon size={20} />
              </div>
              <div className="no-results-content">
                <p className="no-results-title">¿No encuentras "{searchQuery}"?</p>
                <p className="no-results-description">Puedes añadirlo a tu lista de perfumes personalizados.</p>
                <Button
                  onClick={() => {
                    setNewCustomPerfume(searchQuery)
                    handleAddCustomPerfume()
                  }}
                  disabled={selectedPerfumes.length >= 3}
                  className="no-results-button"
                >
                  Añadir "{searchQuery}" a mis perfumes
                </Button>
              </div>
            </div>
          )}

          {/* Lista de perfumes personalizados ya añadidos */}
          {customPerfumes.length > 0 && (
            <div className="custom-perfumes-list">
              <h3 className="custom-perfumes-title">Perfumes personalizados añadidos:</h3>
              <div className="custom-perfumes-items">
                {customPerfumes.map((perfume) => (
                  <div
                    key={perfume.id}
                    className={`custom-perfume-item ${selectedPerfumes.includes(perfume.id) ? "custom-perfume-selected" : ""}`}
                  >
                    <div className="custom-perfume-item-icon">
                      <PlusIcon size={20} />
                    </div>
                    <div className="custom-perfume-item-info">
                      <p className="custom-perfume-item-name">{perfume.name}</p>
                      <p className="custom-perfume-item-brand">Personalizado</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleSelectPerfume(perfume.id)}
                      className={`custom-perfume-item-button ${selectedPerfumes.includes(perfume.id) ? "custom-perfume-item-button-selected" : ""}`}
                    >
                      {selectedPerfumes.includes(perfume.id) ? <CheckIcon size={20} /> : "Seleccionar"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mostrar perfumes filtrados por marca en carruseles horizontales */}
          {(!searchQuery || filteredPerfumes.length > 0) && (
            <div className="perfumes-by-brand">
              {/* Tutorial flotante que se muestra inicialmente */}
              {showTutorial && filteredPerfumes.length > 0 && (
                <div className="tutorial-tooltip">
                  <HandIcon size={16} />
                  <span>¡Haz clic para seleccionar!</span>
                </div>
              )}

              {/* Mostrar perfumes por marca */}
              {(searchQuery ? filteredBrands : sortedBrands).map((brand) => {
                const brandPerfumes = searchQuery ? filteredPerfumesByBrand[brand] : perfumesByBrand[brand]
                const brandId = brand.replace(/\s+/g, "-").toLowerCase()

                return (
                  <div key={brand} className="brand-section">
                    <div className="brand-header">
                      <h3 className="brand-title">{brand}</h3>
                      <div className="brand-navigation">
                        <button className="brand-nav-button" onClick={() => scrollCarousel(brandId, "left")}>
                          <ChevronLeftIcon size={16} />
                        </button>
                        <button className="brand-nav-button" onClick={() => scrollCarousel(brandId, "right")}>
                          <ChevronRightIcon size={16} />
                        </button>
                      </div>
                    </div>

                    <div id={`carousel-${brandId}`} className="brand-carousel hide-scrollbar">
                      {brandPerfumes.map((perfume) => (
                        <div
                          key={perfume.id}
                          className="perfume-card-container"
                          style={{ width: isMobile ? "140px" : "160px" }}
                        >
                          <Card
                            className={`perfume-card ${selectedPerfumes.includes(perfume.id) ? "perfume-card-selected" : ""}`}
                            onClick={() => handleSelectPerfume(perfume.id)}
                          >
                            <div className="perfume-card-overlay">
                              <div className="perfume-card-badge">
                                {selectedPerfumes.includes(perfume.id) ? "✓" : "+"}
                              </div>
                            </div>

                            <div className="perfume-image-container">
                              <img
                                src={perfume.image || "/placeholder.svg"}
                                alt={perfume.name}
                                className="perfume-image"
                              />
                              {selectedPerfumes.includes(perfume.id) && (
                                <div className="perfume-selected-badge">
                                  <CheckIcon size={12} />
                                </div>
                              )}
                            </div>
                            <div className="perfume-info">
                              <h3 className="perfume-name">{perfume.name}</h3>
                            </div>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="add-custom-button-container">
            <Button
              variant="outline"
              onClick={() => setShowCustomInput(true)}
              className="add-custom-button"
              disabled={selectedPerfumes.length >= 3 || showCustomInput}
              icon={<PlusIcon size={16} />}
            >
              Añadir perfume personalizado
            </Button>
          </div>

          {/* Botón flotante para continuar cuando se seleccionan 3 perfumes */}
          {selectedPerfumes.length === 3 && (
            <div className="floating-button-container">
              <Button
                onClick={handleStartRanking}
                className="floating-button"
                size="large"
                icon={<ChevronRightIcon className="floating-button-icon" size={20} />}
              >
                Continuar al paso 2: Ordenar perfumes
              </Button>
            </div>
          )}
        </div>
      )}

      {step === "ranking" && (
        <div className="ranking-container">
          <div className="ranking-instructions">
            {/* <div className="ranking-header">
              <h3 className="ranking-step">Paso 2 de 2: Ordenar tus perfumes</h3>
              <span className="ranking-badge">Último paso</span>
            </div> */}

            <div className="ranking-help">
              <span className="ranking-help-icon">
                <InfoIcon size={20} />
              </span>
              <div className="ranking-help-text">
                <p>
                  Ahora ordena tus 3 perfumes del que <strong>más te gusta</strong> (1) al que{" "}
                  <strong>menos te gusta</strong> (3).
                </p>
                <div className="ranking-controls-help">
                  <div className="ranking-control-item">
                    <ChevronRightIcon className="rotate-270" size={16} />
                    <span>Mover hacia arriba</span>
                  </div>
                  <div className="ranking-control-item">
                    <ChevronRightIcon className="rotate-90" size={16} />
                    <span>Mover hacia abajo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="ranking-title">Ordena tus perfumes del más favorito al menos favorito</h2>

          <div className="ranked-perfumes">
            {rankedPerfumes.map((perfumeId, index) => {
              const details = getPerfumeDetails(perfumeId)
              return (
                <div key={perfumeId} className="ranked-perfume-item">
                  <div className="ranked-perfume-content">
                    <div className="ranked-perfume-number">{index + 1}</div>
                    <div className="ranked-perfume-image-container">
                      {perfumeId.startsWith("custom-") ? (
                        <div className="ranked-perfume-custom-icon">
                          <PlusIcon size={24} />
                        </div>
                      ) : (
                        <img
                          src={details.image || "/placeholder.svg"}
                          alt={details.name}
                          className="ranked-perfume-image"
                        />
                      )}
                    </div>
                    <div className="ranked-perfume-info">
                      <h3 className="ranked-perfume-name">{details.name}</h3>
                      <p className="ranked-perfume-brand">{details.brand}</p>
                    </div>
                    <div className="ranked-perfume-controls">
                      <Tooltip content="Mover hacia arriba">
                        <button
                          className="ranked-perfume-button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          aria-label="Mover hacia arriba"
                        >
                          <ChevronRightIcon className="rotate-270" size={18} />
                        </button>
                      </Tooltip>

                      <Tooltip content="Mover hacia abajo">
                        <button
                          className="ranked-perfume-button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === rankedPerfumes.length - 1}
                          aria-label="Mover hacia abajo"
                        >
                          <ChevronRightIcon className="rotate-90" size={18} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recordatorio para enviar la encuesta */}
          {showSubmitReminder && (
            <div className="submit-reminder">
              <ArrowRightIcon className="submit-reminder-icon" size={24} />
              <p className="submit-reminder-text">
                ¡No olvides enviar tus respuestas cuando hayas terminado de ordenar tus perfumes!
              </p>
            </div>
          )}

          <div className="submit-container">
            <Button onClick={handleSubmit} className="submit-button" size="large" icon={<CheckIcon size={20} />}>
              Finalizar y enviar respuestas
            </Button>
          </div>
        </div>
      )}

      {step === "complete" && (
        <div className="complete-container">
          <div className="complete-header">
            <h2 className="complete-title">¡Gracias por completar la encuesta!</h2>
            <p className="complete-subtitle">Tus respuestas han sido registradas.</p>
          </div>

          <div className="complete-summary">
            <h3 className="summary-title">Resumen de tus selecciones:</h3>

            <div className="summary-decants">
              <p className="summary-question">¿Compraría decants de sus perfumes favoritos?</p>
              <p className="summary-answer">{wouldBuyDecants ? "Sí, compraría decants" : "No, no compraría decants"}</p>
            </div>

            <h4 className="summary-perfumes-title">Perfumes favoritos (en orden):</h4>
            <ul className="summary-perfumes-list">
              {rankedPerfumes.map((perfumeId, index) => {
                const details = getPerfumeDetails(perfumeId)
                return (
                  <li key={perfumeId} className="summary-perfume-item">
                    <span className="summary-perfume-rank">{index + 1}.</span>
                    <span className="summary-perfume-name">{details.name}</span>
                    {perfumeId.startsWith("custom-") && <span className="summary-perfume-custom">Personalizado</span>}
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="complete-actions">
            <Button
              onClick={() => {
                setSelectedPerfumes([])
                setRankedPerfumes([])
                setCustomPerfumes([])
                setSearchQuery("")
                setStep("intro")
              }}
              variant="outline"
              className="restart-button"
            >
              Realizar otra encuesta
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerfumeSurvey

