# DIAGRAMA COMPLETO DEL AUTOMATION - JOBS WORKFLOW

## FLUJO PRINCIPAL DEL AUTOMATION

```mermaid
graph TD
    A[Automation Controller] --> B[Automation Progress]
    B --> C{while true}
    C --> D[Query BD: Tareas Pendientes]
    D --> E{batch_mode > 0?}
    
    E -->|SÍ| F[Separar por Status]
    E -->|NO| G[Query: status=60 + types 7,10,11]
    
    F --> H[Status 10: running_pids]
    F --> I[Status 60: waiting_pids]
    F --> J[Status 70: working_pids]
    
    H --> K[Calcular Slots Disponibles]
    I --> K
    J --> K
    
    K --> L{Slots > 0?}
    L -->|SÍ| M[Promocionar waiting_pids]
    L -->|NO| N[No enviar nuevas tareas]
    
    M --> O[UPDATE jwjo_status: 60→10]
    O --> P[Procesar Tareas]
    N --> P
    G --> P
    
    P --> Q{Type de Tarea?}
    Q -->|Type 7| R[EXTERNAL_AUTOMATION]
    Q -->|Type 10| S[API_CLIENT]
    Q -->|Type 11| T[STAGE_CORE]
    
    R --> U[POST al Gateway]
    S --> V[HTTP Call a API]
    T --> W[Operación Interna]
    
    U --> X[Worker Procesa]
    V --> Y[Respuesta API]
    W --> Z[StepForward]
    
    X --> AA[Gateway Responde]
    Y --> Z
    AA --> Z
    
    Z --> BB[StepForward]
    BB --> CC[PropagateMetadata]
    CC --> DD[Eval_condition]
    DD --> EE{Condición OK?}
    EE -->|SÍ| FF[Crear Nueva Tarea]
    EE -->|NO| GG[No Avanzar]
    
    FF --> HH[Actualizar Status]
    GG --> II[sleep 5 segundos]
    HH --> II
    II --> C
```

## CICLO DE VIDA DE UN JOB

```mermaid
graph TD
    A[Watchfolder Detecta Archivo] --> B[Crear Job]
    B --> C[jwjo_status = 60<br/>jwta_status = 60]
    C --> D[Automation Loop]
    
    D --> E{batch_mode > 0?}
    E -->|SÍ| F[Verificar Slots]
    E -->|NO| G[Procesar Inmediatamente]
    
    F --> H{Slots Disponibles?}
    H -->|SÍ| I[Promocionar Job]
    H -->|NO| J[Esperar Slot]
    
    I --> K[jwjo_status: 60→10]
    G --> K
    K --> L[Enviar al Gateway/API]
    
    L --> M[Worker/API Procesa]
    M --> N[Respuesta]
    N --> O[StepForward]
    
    O --> P{Última Etapa?}
    P -->|NO| Q[Crear Siguiente Tarea]
    P -->|SÍ| R[Job Completado]
    
    Q --> S[jwjo_status = 30]
    R --> S
    S --> T[Fin del Job]
    
    J --> U[sleep 5 seg]
    U --> D
```

## BATCH MODE - CONTROL DE CONCURRENCIA

```mermaid
graph TD
    A[Query: Todas las Tareas] --> B[Separar por jwjo_status]
    
    B --> C[Status 10: running_pids]
    B --> D[Status 60: waiting_pids]
    B --> E[Status 70: working_pids]
    
    C --> F[Agrupar por PID]
    D --> G[Ordenar por Metadata/PID]
    E --> H[Filtrar ONESTEP/MANUAL]
    
    F --> I[Contar Jobs Únicos]
    I --> J[Calcular Slots Disponibles]
    
    J --> K{Slots > 0?}
    K -->|SÍ| L[Promocionar waiting_pids]
    K -->|NO| M[No Enviar Nuevas]
    
    L --> N[UPDATE jwjo_status: 60→10]
    N --> O[Reducir available_slots]
    O --> P[Procesar Tareas Promocionadas]
    
    M --> Q[Verificar Status de Running]
    P --> Q
    Q --> R[Continuar Loop]
```

## STAGE TYPES

```mermaid
graph TD
    A[STAGE TYPES] --> B[1: NORMAL/MANUAL]
    A --> C[2: AUTO]
    A --> D[3: VIRTUAL]
    A --> E[4: ONESTEP]
    A --> F[5: REMOTE]
    A --> G[6: SUBWORKFLOW_START]
    A --> H[7: EXTERNAL_AUTOMATION]
    A --> I[10: API_CLIENT]
    A --> J[11: STAGE_CORE]
    
    B --> K[Usuario Interactúa]
    C --> L[Auto-completa]
    D --> M[Invisible, Lógica Interna]
    E --> N[Auto-completa al Abrir]
    F --> O[Proceso Remoto]
    G --> P[Inicia Sub-workflow]
    H --> Q[Envía a Worker]
    I --> R[HTTP Call API]
    J --> S[Operación Interna Core]
```

## FLUJO COMPLETO CON EJEMPLO

```mermaid
sequenceDiagram
    participant WF as Watchfolder
    participant C as Core
    participant A as Automation
    participant G as Gateway
    participant W as Worker
    
    WF->>C: Archivo detectado
    C->>C: Crear Job 100
    Note over C: jwjo_status=60, jwta_status=60
    
    A->>C: Query tareas (Vuelta 1)
    C->>A: Job 100 (status 60)
    A->>A: batch_mode check
    A->>C: UPDATE jwjo_status=10
    A->>G: POST tarea
    Note over A,G: jwta_status=60→10
    
    G->>W: .req.json file
    W->>W: Procesar operación
    W->>G: Respuesta status 102
    
    A->>C: Query tareas (Vuelta 2)
    C->>A: Job 100 (status 10)
    A->>G: GET status
    G->>A: status 102 (procesando)
    
    W->>G: Respuesta status 200
    A->>C: Query tareas (Vuelta 3)
    A->>G: GET status
    G->>A: status 200 (completado)
    A->>A: StepForward()
    A->>C: Crear siguiente tarea
    Note over A,C: jwta_status=10→30
    
    A->>C: Query tareas (Vuelta 4)
    Note over A,C: Job 100 no aparece (status 30)
```

## TIMELINE DE UNA VUELTA DEL AUTOMATION

```mermaid
gantt
    title Vuelta del Automation (5 segundos)
    dateFormat X
    axisFormat %L
    
    section Query BD
    Consulta tareas pendientes    :0, 100
    
    section Batch Mode
    Separar por status           :100, 200
    Calcular slots               :200, 300
    Promocionar waiting          :300, 400
    
    section Procesar
    Enviar al Gateway            :400, 800
    Consultar status             :800, 1200
    StepForward                  :1200, 1400
    
    section Finalizar
    Cerrar conexión BD           :1400, 1500
    sleep 5 segundos             :1500, 5000
```

## CORE CADENCE - CONTROL DE FRECUENCIA

```mermaid
sequenceDiagram
    participant A as Automation
    participant T as Task (core_cadence=30)
    participant G as Gateway/API
    
    Note over A,T: Vuelta 1 (Segundo 0)
    A->>T: Revisa task
    T->>T: jwta_last_update = 0
    T->>T: timedifference = 0
    T->>T: Primera vez → PROCESA
    A->>G: Envía al Gateway
    T->>T: UPDATE jwta_last_update = 0
    
    Note over A,T: Vuelta 2 (Segundo 5)
    A->>T: Revisa task
    T->>T: timedifference = 5 - 0 = 5
    T->>T: 5 < 30 → NO PROCESA
    A->>A: continue (salta)
    
    Note over A,T: Vuelta 3 (Segundo 10)
    A->>T: Revisa task
    T->>T: timedifference = 10 - 0 = 10
    T->>T: 10 < 30 → NO PROCESA
    A->>A: continue (salta)
    
    Note over A,T: Vuelta 7 (Segundo 30)
    A->>T: Revisa task
    T->>T: timedifference = 30 - 0 = 30
    T->>T: 30 >= 30 → PROCESA
    A->>G: Re-envía al Gateway
    T->>T: UPDATE jwta_last_update = 30
    
    Note over A,T: Vuelta 8 (Segundo 35)
    A->>T: Revisa task
    T->>T: timedifference = 35 - 30 = 5
    T->>T: 5 < 30 → NO PROCESA
    A->>A: continue (salta)
```

## RESUMEN DE CONCEPTOS CLAVE

### JERARQUÍA FUNDAMENTAL
```
PROCESS (Workflow)
    └─ STAGES (Etapas/Plantillas) - Se definen 1 vez
        └─ JOBS (PIDs) - 1 por cada archivo
            └─ TASKS (Instancias) - Se crean "just in time"
```

### Process vs Job vs Stage vs Task
- **PROCESS**: Workflow completo (ej: "ESPN DR Playlist", ID: 12)
- **STAGE**: Plantilla de una etapa (ej: "Leer archivo", ID: 5, existe 1 vez)
- **JOB**: Instancia del workflow (ej: Job 100, cuando llega un archivo)
- **TASK**: Instancia de una STAGE para un JOB (ej: Task 5001 = Job 100 en Stage 5)

**CLAVE**: Las tasks NO existen todas desde el inicio. Se crean cuando el job LLEGA a esa stage.

### Automation Controller
- Proceso maestro que gestiona child processes
- **1 Automation Progress por cada PROCESS (workflow)**
- Monitorea y reinicia procesos hijos
- Comando: `php jwf_automation_progress.php --process 12`

### Automation Progress
- **1 proceso hijo por workflow**
- Query cada 5 segundos: `WHERE jwst_process = [su_proceso]`
- Procesa SOLO tareas de su proceso
- Procesos en paralelo independientes

### Batch Mode
- Control de concurrencia **por JOBS, no por tareas**
- Limita cantidad de jobs simultáneos **dentro de cada proceso**
- Ordena por metadata o PID
- Un job con 10 tareas cuenta como 1 slot
- Cada proceso tiene su propio batch_mode

### Core Cadence
- **Intervalo de tiempo** (segundos) entre re-ejecuciones
- Se usa en Type 7 (EXTERNAL_AUTOMATION) y Type 10 (API_CLIENT)
- El Core verifica ANTES de enviar al Gateway/API
- Si no pasó suficiente tiempo → `continue` (salta)
- Útil para POLLING: consultar estado cada X segundos
- Ejemplo: `core_cadence: 60` = re-ejecuta cada 60 segundos

### StepForward
- Avanza jobs a siguiente etapa
- Evalúa condiciones de transición
- **Crea nueva task** para la siguiente stage
- Marca task actual como completada

### Eval_condition
- Evalúa expresiones con variables
- @f10, @e5, @$$WORKER
- Retorna true/false

### Status Flow
- Job: 60→10→70→30
- Task: 60→10→30
- Control de slots por job status

---
