// ============================================
// SISTEMA DE NOTAS MARKDOWN
// ============================================


// --------------------------------------------
// UTILIDADES DE TEXTO
// --------------------------------------------
/* Extrae el título de una nota desde su contenido */
function deriveTitle(content) {
    if (content === '' || content === null || content === undefined) {
      return 'Sin título';
    }
  
    const cleanContent = content.trim();
  
    if (cleanContent === '') {
      return 'Sin título';
    }
  
    let firstLine = '';
    let foundNewLine = false;
  
    for (let i = 0; i < cleanContent.length; i = i + 1) {
      const char = cleanContent[i];
  
      if (char === '\n') {
        foundNewLine = true;
        break;
      }
  
      firstLine = firstLine + char;
    }
  
    if (firstLine.trim() === '') {
      return 'Sin título';
    }
  
    if (firstLine.length > 50) {
      firstLine = firstLine.slice(0, 50) + '...';
    }
  
    return firstLine.trim();
}


/**Extrae un resumen corto del contenido de la nota*/
function deriveExcerpt(content, maxLen) {
  if (content === '' || content === null || content === undefined) {
    return '';
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

  if (trimmedContent === '') {
    return null;
  }

  const noteId = generateId();

  const currentTime = Date.now();

  let noteTitle = title;
  if (noteTitle === undefined || noteTitle === null || noteTitle === '') {
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
    if (content === undefined || content === null || content.trim() === '') {
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
    const notesCopy = notes.map(function (note) {
      return { ...note };
    });

    return notesCopy;
  }

  function getNoteById(noteId) {
    const foundNote = notes.find(function (note) {
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

// Crear una instancia del store
console.log('=== CREAR STORE ===');
const notesStore = createNotesStore();
console.log('Store creado exitosamente');
console.log('Total de notas:', notesStore.getNotesCount());

// Ejemplo 1: Agregar notas al store
console.log('\n=== AGREGAR NOTAS ===');
const result1 = notesStore.addNote(
  '# Mi primera nota\nEste es el contenido de mi primera nota en Markdown.',
);
console.log('Nota 1 agregada:', result1.success);
console.log('Detalles:', result1.note);

const result2 = notesStore.addNote(
  '# Aprender JavaScript\nHoy aprendí sobre arrays y métodos de orden superior como map, filter y find.',
);
console.log('\nNota 2 agregada:', result2.success);

const result3 = notesStore.addNote(
  '# Lista de tareas\n- Estudiar closures\n- Practicar con objetos\n- Hacer ejercicios de arrays',
  'Tareas del día',
);
console.log('Nota 3 agregada:', result3.success);

// Ejemplo 2: Intentar agregar nota vacía (validación)
console.log('\n=== VALIDACIÓN: NOTA VACÍA ===');
const resultEmpty = notesStore.addNote('   ');
console.log('Resultado:', resultEmpty.message);

// Ejemplo 3: Obtener todas las notas
console.log('\n=== OBTENER TODAS LAS NOTAS ===');
const allNotes = notesStore.getAllNotes();
console.log('Total de notas:', allNotes.length);
allNotes.forEach(function (note) {
  console.log(`- ${note.title} (ID: ${note.id})`);
});

// Ejemplo 4: Buscar una nota por ID
console.log('\n=== BUSCAR NOTA POR ID ===');
const firstNoteId = result1.note.id;
const foundNote = notesStore.getNoteById(firstNoteId);
console.log('Nota encontrada:', foundNote.title);
console.log('Contenido:', foundNote.content);

// Ejemplo 5: Actualizar una nota
console.log('\n=== ACTUALIZAR NOTA ===');
const updateResult = notesStore.updateNote(firstNoteId, {
  content: '# Mi primera nota actualizada\nHe modificado el contenido de esta nota.',
});
console.log('Actualización exitosa:', updateResult.success);
console.log('Nuevo título:', updateResult.note.title);

// Ejemplo 6: Marcar una nota como favorita
console.log('\n=== MARCAR COMO FAVORITA ===');
const favoriteResult = notesStore.updateNote(result2.note.id, { favorite: true });
console.log('Nota marcada como favorita:', favoriteResult.success);

// Ejemplo 7: Buscar notas por texto
console.log('\n=== BUSCAR NOTAS (searchNotes) ===');
const searchResults = notesStore.searchNotes('JavaScript');
console.log('Notas encontradas:', searchResults.length);
searchResults.forEach(function (note) {
  console.log(`- ${note.title}`);
});

// Ejemplo 8: Obtener notas ordenadas por fecha
console.log('\n=== NOTAS ORDENADAS POR FECHA ===');
const orderedNotes = notesStore.getNotesOrderedByDate();
console.log('Notas (más recientes primero):');
orderedNotes.forEach(function (note) {
  console.log(`- ${note.title} (Actualizada: ${new Date(note.updatedAt).toLocaleString()})`);
});

// Ejemplo 9: Obtener notas favoritas
console.log('\n=== NOTAS FAVORITAS ===');
const favorites = notesStore.getFavoriteNotes();
console.log('Total de favoritas:', favorites.length);
favorites.forEach(function (note) {
  console.log(`- ${note.title}`);
});

// Ejemplo 10: Eliminar una nota
console.log('\n=== ELIMINAR NOTA ===');
const deleteResult = notesStore.deleteNote(result3.note.id);
console.log('Eliminación exitosa:', deleteResult.success);
console.log('Total de notas después de eliminar:', notesStore.getNotesCount());

// Ejemplo 11: Demostración de closure (el estado es privado)
console.log('\n=== DEMOSTRACIÓN DE CLOSURE ===');
console.log('El array "notes" no es accesible directamente desde afuera del store');
console.log('Solo podemos acceder a través de los métodos públicos del store');
console.log('Total de notas (usando método público):', notesStore.getNotesCount());