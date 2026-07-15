// ============================================
// SISTEMA DE NOTAS MARKDOWN
// ============================================

const STORAGE_KEY = 'markdown-notes'
let currentNoteId = null

// --------------------------------------------
// UTILIDADES DE TEXTO
// --------------------------------------------

/**
 * Extrae el título de una nota desde su contenido
 * @param {string} content - Contenido de la nota
 * @returns {string} Título derivado del contenido
 */
function deriveTitle(content) {
    if (content === "" || content === null || content === undefined) {
      return "Sin título";
    }
  
    const cleanContent = content.trim();
  
    if (cleanContent === "") {
      return "Sin título";
    }
  
    let firstLine = "";
    let foundNewLine = false;
  
    for (let i = 0; i < cleanContent.length; i++) {
      const char = cleanContent[i];
  
      if (char === "\n") {
        foundNewLine = true;
        break;
      }
  
      firstLine = firstLine + char;
    }
  
    if (firstLine.trim() === "") {
      return "Sin título";
    }
  
    if (firstLine.length > 50) {
      firstLine = firstLine.slice(0, 50) + "...";
    }
  
    return firstLine.trim();
}

/**
 * Extrae un resumen corto del contenido de la nota
 * @param {string} content - Contenido de la nota
 * @param {number} maxLen - Longitud máxima del resumen (opcional)
 * @returns {string} Resumen del contenido
 */
function deriveExcerpt(content, maxLen) {
  if (content === "" || content === null || content === undefined) {
    return ""
  }

  let maxLength = maxLen;
  if (maxLength === undefined || maxLength === null) {
    maxLength = 100;
  }

  const cleanContent = content.trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  const excerpt = cleanContent.slice(0, maxLength) + '...';

  return excerpt;
}


// --------------------------------------------
// GENERACIÓN DE ID ÚNICO
// --------------------------------------------
/**
 * Genera un ID único basado en la fecha actual
 * @returns {number} Timestamp en milisegundos desde 1970
 */
function generateId() {
  const timestamp = Date.now();
  return timestamp;
}


// --------------------------------------------
// FUNCIONES CRUD DE NOTAS
// --------------------------------------------

/**
 * Crea un objeto de nota con el contenido proporcionado
 * @param {string} content - Contenido de la nota
 * @param {string} title - Título de la nota (opcional)
 * @returns {Object|null} Objeto de nota o null si hay error
 */
function createNote(content, title) {
  const trimmedContent = content.trim();

  if (trimmedContent === "") {
    return null;
  }

  const noteId = generateId();

  const currentTime = Date.now();

  let noteTitle = title;
  if (noteTitle === undefined || noteTitle === null || noteTitle === "") {
    noteTitle = deriveTitle(content);
  }

  const noteExcerpt = deriveExcerpt(content, 100);

  const note = {
    id: noteId,
    content: content,
    title: noteTitle,
    excerpt: noteExcerpt,
    createdAt: currentTime,
    updatedAt: currentTime,
    favorite: false,
  };

  return note;
}

/**
 * Guarda las notas en LocalStorage
 * @param {Array} notes - Array de notas a guardar 
 */

function saveToStorage(notes) {
  if (notes === null || notes === undefined) {
    console.error('No es posible guardar las notas: Datos inválidos')
    return
  }
  const notesJSON = JSON.stringify(notes)
  localStorage.setItem(STORAGE_KEY, notesJSON)
}

/**
 * carga las notas desde LocalStorage
 * @returns {Array} Array de notas o array vacio si no hay datos
 */
function loadFromStorage() {
  const notesJSON = localStorage.getItem(STORAGE_KEY)

  if (notesJSON === null || notesJSON === undefined) {
    return []
  }

  let notes = []
  const parsedNotes = JSON.parse(notesJSON)

  if (Array.isArray(parsedNotes)) {
    notes = parsedNotes
  }

  return notes
}

/**
 * Crea un store que persiste automáticamente en localStorage
 * @returns {Object} Store con métodos para gestionar notas
 */
function createPersistentNotesStore() {
  let notes = loadFromStorage()

  /**
   * Agrega una nueva nota y la persiste en localStorage
   * @param {string} content - Contenido de la nota
   * @param {string} [title] - Título opcional de la nota
   * @returns {Object} Resultado de la operación
   */
  function addNote(content, title) {
    if (content === undefined || content === null || content.trim() === "") {
      return { success: false, message: 'El contenido no puede estar vacío' };
    }

    const newNote = createNote(content, title);

    if (newNote === null) {
      return { success: false, message: 'Error al crear la nota' };
    }

    notes.push(newNote);
    saveToStorage(notes)

    return { success: true, note: newNote };
  }

  /**
   * Obtiene todas las notas
   * @returns {Array} Copia del array de notas
   */
  function getAllNotes() {
    const notesCopy = notes.map((note) => {
      return { ...note };
    });

    return notesCopy;
  }

  /**
   * Obtiene una nota por su ID
   * @param {number} noteId - ID de la nota a buscar
   * @returns {Object|null} Nota encontrada o null si no existe
   */
  function getNoteById(noteId) {
    const foundNote = notes.find((note) => {
      return note.id === noteId;
    });

    if (foundNote === undefined) {
      return null;
    }

    return { ...foundNote };
  }

  /**
   * Actualiza una nota existente
   * @param {number} noteId - ID de la nota a actualizar
   * @param {Object} updates - Campos a actualizar
   * @param {string} [updates.content] - Nuevo contenido
   * @param {string} [updates.title] - Nuevo título
   * @param {boolean} [updates.favorite] - Estado de favorito
   * @returns {Object} Resultado de la operación
   */
  function updateNote(noteId, updates) {
    if (noteId === undefined || noteId === null) {
      return { success: false, message: 'ID inválido' };
    }

    const noteToUpdate = notes.find(function (note) {
      return note.id === noteId;
    });

    if (noteToUpdate === undefined) {
      return { success: false, message: 'Nota no encontrada' };
    }

    if (updates.content !== undefined) {
      const trimmedContent = updates.content.trim();

      if (trimmedContent === '') {
        return { success: false, message: 'El contenido no puede estar vacío' };
      }

      noteToUpdate.content = updates.content;
      noteToUpdate.title = deriveTitle(updates.content);
      noteToUpdate.excerpt = deriveExcerpt(updates.content, 100);
    }

    if (updates.title !== undefined && updates.title !== '') {
      noteToUpdate.title = updates.title;
    }

    if (updates.favorite !== undefined) {
      noteToUpdate.favorite = updates.favorite;
    }

    noteToUpdate.updatedAt = Date.now();
    saveToStorage(notes);

    return { success: true, note: { ...noteToUpdate } };
  }

  /**
   * Elimina una nota por su ID
   * @param {number} noteId - ID de la nota a eliminar
   * @returns {Object} Resultado de la operación
   */
  function deleteNote(noteId) {
    if (noteId === undefined || noteId === null) {
      return { success: false, message: 'ID inválido' };
    }

    const initialLength = notes.length;

    notes = notes.filter(function (note) {
      return note.id !== noteId;
    });

    if (notes.length === initialLength) {
      return { success: false, message: 'Nota no encontrada' };
    }
  
    saveToStorage(notes);

    return { success: true, message: 'Nota eliminada exitosamente' };
  }

  /**
   * Busca notas por texto en título o contenido
   * @param {string} query - Texto a buscar
   * @returns {Array} Notas que coinciden con la búsqueda
   */
  function searchNotes(query) {
    if (query === undefined || query === null || query.trim() === '') {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();

    const results = notes.filter(function (note) {
      const normalizedTitle = note.title.toLowerCase();
      const normalizedContent = note.content.toLowerCase();

      const matchesTitle = normalizedTitle.includes(normalizedQuery);
      const matchesContent = normalizedContent.includes(normalizedQuery);

      return matchesTitle || matchesContent;
    });

    return results.map(function (note) {
      return { ...note };
    });
  }

  /**
   * Obtiene las notas ordenadas por fecha de actualización
   * @returns {Array} Notas ordenadas de más reciente a más antigua
   */
  function getNotesOrderedByDate() {
    const notesCopy = notes.map(function (note) {
      return { ...note };
    });

    notesCopy.sort(function (a, b) {
      return b.updatedAt - a.updatedAt;
    });

    return notesCopy;
  }

  /**
   * Obtiene las notas marcadas como favoritas
   * @returns {Array} Notas favoritas
   */
  function getFavoriteNotes() {
    const favorites = notes.filter(function (note) {
      return note.favorite === true;
    });

    return favorites.map(function (note) {
      return { ...note };
    });
  }

  /**
   * Obtiene el número total de notas
   * @returns {number} Cantidad de notas
   */
  function getNotesCount() {
    return notes.length;
  }

  return {
    addNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote,
    searchNotes,
    getNotesOrderedByDate,
    getFavoriteNotes,
    getNotesCount
  };
}

/**
 * Muestra el editor y el preview
 */
function showEditorAndPreview() {
  const editorSection = document.querySelector('#editor-section')
  const previewSection = document.querySelector('#preview-section')

  editorSection.style.display = 'flex'
  previewSection.style.display = 'flex'
}

/**
 * Oculta el editor y el preview
 */
function hideEditorAndPreview() {
  const editorSection = document.querySelector('#editor-section')
  const previewSection = document.querySelector('#preview-section')

  editorSection.style.display = 'none'
  previewSection.style.display = 'none'
}

/**
 * Renderiza la lista de notas en el DOM
 * @param {Array} notes - Array de notas a renderizar
 */
function renderNoteList(notes) {
  const noteListContainer = document.querySelector('#note-list')

  if (noteListContainer === null) {
    return
  }

  noteListContainer.textContent = ''

  if (notes === null || notes === undefined || notes.length === 0) {
    const emptyState = document.createElement('p')
    emptyState.className = 'note-list-empty'
    emptyState.textContent = 'No hay notas todavía'
    noteListContainer.appendChild(emptyState)
    return
  }

  notes.forEach(function (note) {
    const noteItem = document.createElement('article')
    noteItem.className = 'note-item'
    noteItem.dataset.noteId = String(note.id)

    if (note.id === currentNoteId) {
      noteItem.classList.add('active')
    }

    const titleElement = document.createElement('h3')
    titleElement.className = 'note-item-title'
    titleElement.textContent = note.title

    const excerptElement = document.createElement('p')
    excerptElement.className = 'note-item-excerpt'
    excerptElement.textContent = note.excerpt

    const dateElement = document.createElement('time')
    dateElement.className = 'note-item-date'
    const noteDate = new Date(note.updatedAt)
    dateElement.dateTime = noteDate.toISOString()
    dateElement.textContent = noteDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

    noteItem.appendChild(titleElement)
    noteItem.appendChild(excerptElement)
    noteItem.appendChild(dateElement)
    noteListContainer.appendChild(noteItem)
  })
}

/**
 * Renderiza el editor con el contenido de una nota
 * @param {object||null} nota - Nota a renderizar o null para el editor vacio
 */
function renderEditor(note) {
  const titleInput = document.querySelector('#note-title')
  const contentTextarea = document.querySelector('#note-content')

  if (titleInput === null || contentTextarea === null) {
    return
  }

  if (note === null || note === undefined) {
    titleInput.value = ''
    contentTextarea.value = ''
    currentNoteId = null
    return
  }

  titleInput.value = note.title
  contentTextarea.value = note.content
  currentNoteId = note.id
  showEditorAndPreview()
}

/**
 * Renderiza el preview del contenido markdown
 * @param {string} content - Contenido markdown a renderizar
 */
function renderPreview(content) {
  const previewContainer = document.querySelector('#preview-content')

  if (previewContainer === null) {
    return
  }

  previewContainer.textContent = ''

  if (content === null || content === undefined || content.trim() === '') {
    const emptyState = document.createElement('p')
    emptyState.className = 'preview-empty'
    emptyState.textContent = 'No hay contenido para previsualizar'
    previewContainer.appendChild(emptyState)
    return
  }

  const previewElement = document.createElement('div')
  previewElement.className = 'markdown-preview'
  previewElement.textContent = content
  previewContainer.appendChild(previewElement)
}