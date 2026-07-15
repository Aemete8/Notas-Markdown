// ============================================
// SISTEMA DE NOTAS MARKDOWN
// ============================================

const STORAGE_KEY = 'markdown-notes'

// --------------------------------------------
// UTILIDADES DE TEXTO
// --------------------------------------------
/* Extrae el título de una nota desde su contenido */
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


/**Extrae un resumen corto del contenido de la nota*/
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
/*Genera un ID único basado en la fecha actual*/
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

// --------------------------------------------
// STORE DE NOTAS (FASE 2)
// Usa closures para encapsular el estado
// --------------------------------------------

/**
 * Crea un store para manejar el estado de las notas
 * @returns {Object} Objeto con métodos para interactuar con las notas
 */
function createNotesStore() {
  let notes = [];

  function addNote(content, title) {
    if (content === undefined || content === null || content.trim() === "") {
      return { success: false, message: 'El contenido no puede estar vacío' };
    }

    const newNote = createNote(content, title);

    if (newNote === null) {
      return { success: false, message: 'Error al crear la nota' };
    }

    notes.push(newNote);

    return { success: true, note: newNote };
  }

  function getAllNotes() {
    const notesCopy = notes.map((note) => {
      return { ...note };
    });

    return notesCopy;
  }

  function getNoteById(noteId) {
    const foundNote = notes.find((note) => {
      return note.id === noteId;
    });

    if (foundNote === undefined) {
      return null;
    }

    return { ...foundNote };
  }

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

    return { success: true, note: { ...noteToUpdate } };
  }

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

    return { success: true, message: 'Nota eliminada exitosamente' };
  }

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

  function getNotesOrderedByDate() {
    const notesCopy = notes.map(function (note) {
      return { ...note };
    });

    notesCopy.sort(function (a, b) {
      return b.updatedAt - a.updatedAt;
    });

    return notesCopy;
  }

  function getFavoriteNotes() {
    const favorites = notes.filter(function (note) {
      return note.favorite === true;
    });

    return favorites.map(function (note) {
      return { ...note };
    });
  }

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
 * Guarda las notas en LocalStorage
 * @param {Array} notes - Array de notas a guardar 
 */

function saveToStorageNotes(notes) {
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