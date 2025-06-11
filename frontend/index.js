// --- Referencias a Elementos del DOM ---
const taskForm = document.getElementById('form');
const taskInput = document.getElementById('form-input-task');
const taskList = document.getElementById('task-list');
const errorText = document.getElementById('form-error-text');

// Contadores
const countPending = document.getElementById('cantidad-Pendiente');
const countCompleted = document.getElementById('cantidad-Terminadas');
const countTotal = document.getElementById('cantidad-Total');

// --- Funciones de Renderizado y Actualización ---

/**
 * Actualiza los contadores en el UI
 * @returns {Promise<void>}
 */
async function updateCounters() {
    try {
        const counts = await getTaskCounts();
        countPending.textContent = counts.pending;
        countCompleted.textContent = counts.completed;
        countTotal.textContent = counts.total;
    } catch (error) {
        console.error("Error al actualizar contadores:", error);
    }
}

/**
 * Renderiza la lista de tareas en el UI
 * @returns {Promise<void>}
 */
async function renderTaskList() {
    try {
        const tasks = await getTasks();
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            taskList.innerHTML = '<p>No hay tareas. ¡Añade una nueva tarea!</p>';
            await updateCounters();
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = task.completed ? 'tarea-completada' : 'tarea-Pendiente';
            li.dataset.id = task.id;

            // Contenido del LI (Texto y botones)
            li.innerHTML = `
                <span>${task.text}</span>
                <div class="botones">
                    <button class="btn-Eliminar" title="Eliminar Tarea">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 1.25rem; height: 1.25rem; pointer-events: none;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                    <button class="btn-completar" title="${task.completed ? 'Tarea Completada' : 'Marcar como Completada'}" ${task.completed ? 'disabled' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 1.25rem; height: 1.25rem; pointer-events: none;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    </button>
                </div>
            `;

            taskList.appendChild(li);
        });

        await updateCounters();
    } catch (error) {
        console.error("Error al renderizar la lista de tareas:", error);
        taskList.innerHTML = '<p>Error al cargar las tareas. Intenta recargar la página.</p>';
    }
}

/**
 * Muestra un mensaje de error temporal
 * @param {string} message - Mensaje de error a mostrar
 * @param {number} duration - Duración en ms (por defecto: 3000ms)
 */
function showError(message, duration = 3000) {
    errorText.textContent = message;
    errorText.style.display = 'block';
    
    // Ocultar el mensaje después de la duración especificada
    setTimeout(() => {
        errorText.style.display = 'none';
    }, duration);
}

// --- Manejadores de Eventos ---

/**
 * Maneja el envío del formulario para agregar tareas
 * @param {Event} event - Evento submit
 * @returns {Promise<void>}
 */
async function handleAddTask(event) {
    event.preventDefault();
    const taskText = taskInput.value.trim();

    if (!taskText) {
        showError('Por favor, escribe una tarea.');
        taskInput.focus();
        return;
    }

    try {
        const newTask = await addTask(taskText);
        if (newTask) {
            taskInput.value = '';
            errorText.style.display = 'none';
            await renderTaskList();
            taskInput.focus();
        }
    } catch (error) {
        showError('No se pudo agregar la tarea. Intenta de nuevo.');
        console.error("Error al agregar tarea:", error);
    }
}

/**
 * Maneja los clicks en la lista de tareas (delegación de eventos)
 * @param {Event} event - Evento click
 * @returns {Promise<void>}
 */
async function handleTaskListClick(event) {
    const target = event.target;
    const taskElement = target.closest('li[data-id]');
    
    if (!taskElement) return;
    
    const taskId = taskElement.dataset.id;
    
    // Eliminar Tarea
    if (target.closest('.btn-Eliminar')) {
        // Animación de eliminación
        taskElement.style.opacity = '0';
        taskElement.style.transform = 'translateX(30px)';
        
        setTimeout(async () => {
            try {
                await deleteTask(taskId);
                await renderTaskList();
            } catch (error) {
                console.error("Error al eliminar tarea:", error);
                showError('Error al eliminar tarea. Intenta de nuevo.');
            }
        }, 300);
    }
    // Marcar Tarea como Completada
    else if (target.closest('.btn-completar')) {
        if (!target.closest('.btn-completar').disabled) {
            try {
                await toggleTaskComplete(taskId);
                await renderTaskList();
            } catch (error) {
                console.error("Error al actualizar tarea:", error);
                showError('Error al actualizar tarea. Intenta de nuevo.');
            }
        }
    }
}

/**
 * Inicializa la aplicación cuando el DOM está listo
 * @returns {Promise<void>}
 */
async function initializeApp() {
    // Configurar event listeners
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAddTask(e);
    });
    taskList.addEventListener('click', (e) => {
        handleTaskListClick(e);
    });
    
    // Inicialmente ocultar mensaje de error
    errorText.style.display = 'none';
    
    // Añadir foco inicial al input
    taskInput.focus();
    
    // Renderizar la lista inicial
    await renderTaskList();
}

// Ejecutar inicialización cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initializeApp);
