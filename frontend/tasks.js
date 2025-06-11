const API_URL = 'http://localhost:3000/tasks';

/**
 * @typedef Task
 * @type {object}
 * @property {string} id - Identificador único para la tarea
 * @property {string} text - Texto descriptivo de la tarea
 * @property {boolean} completed - Estado de la tarea (true=completada, false=pendiente)
 * @property {string} createdAt - Fecha de creación en formato ISO
 */

// Nota: Ya no usamos el array local "tasks", todo se consulta al servidor

/**
 * Obtiene todas las tareas desde la API
 * @returns {Promise<Task[]>}
 */
async function getTasks() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Error al obtener tareas');
  return await response.json();
}

/**
 * Agrega una nueva tarea a la API
 * @param {string} text - Texto de la nueva tarea
 * @returns {Promise<Task|null>}
 */
async function addTask(text) {
  const trimmedText = text.trim();
  if (!trimmedText) return null;

  const newTask = {
    text: trimmedText,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTask),
  });
  if (!response.ok) throw new Error('Error al agregar tarea');
  return await response.json();
}

/**
 * Elimina una tarea de la API por su ID
 * @param {string} id - ID de la tarea a eliminar
 * @returns {Promise<boolean>}
 */
async function deleteTask(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar tarea');
  return true;
}

/**
 * Cambia el estado de completado de una tarea por su ID
 * @param {string} id - ID de la tarea a marcar/desmarcar
 * @returns {Promise<Task|null>}
 */
async function toggleTaskComplete(id) {
  const allTasks = await getTasks();
  const taskToUpdate = allTasks.find(task => task.id === id);
  if (!taskToUpdate) return null;

  const updatedTask = {
    ...taskToUpdate,
    completed: !taskToUpdate.completed,
  };

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: updatedTask.completed }),
  });
  if (!response.ok) throw new Error('Error al actualizar tarea');
  return await response.json();
}

/**
 * Calcula y devuelve los contadores de tareas
 * @returns {Promise<{total: number, pending: number, completed: number}>}
 */
async function getTaskCounts() {
  const allTasks = await getTasks();
  const total = allTasks.length;
  const completed = allTasks.filter(task => task.completed).length;
  const pending = total - completed;
  return { total, pending, completed };
}

/**
 * Elimina todas las tareas completadas
 * @returns {Promise<number>}
 */
async function clearCompletedTasks() {
  const allTasks = await getTasks();
  const completedTasks = allTasks.filter(task => task.completed);
  const deletePromises = completedTasks.map(task => deleteTask(task.id));
  await Promise.all(deletePromises);
  return completedTasks.length;
}

// Si necesitas exportar las funciones (para módulos ES):
// export { getTasks, addTask, deleteTask, toggleTaskComplete, getTaskCounts, clearCompletedTasks };
