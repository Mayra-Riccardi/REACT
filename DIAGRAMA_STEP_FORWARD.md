# DIAGRAMA: STEP FORWARD

## StepForward - Avance de Tareas

Copia este código en https://mermaid.live/

```mermaid
graph TD
    A[StepForward Iniciado] --> B[PropagateMetadata]
    B --> C[Buscar Transiciones]
    C --> D[Evaluar Condiciones]
    
    D --> E{eval_condition}
    E --> F[Reemplazar Variables]
    F --> G[Variables: f10, e5, WORKER]
    G --> H[eval PHP Expression]
    H --> I{Resultado?}
    
    I -->|true| J[Agregar a nexts]
    I -->|false| K[Ignorar Transición]
    
    J --> L{Verificar Hermanos}
    K --> L
    L --> M{Todos los Hermanos<br/>Terminaron?}
    
    M -->|SÍ| N[Crear Nueva Tarea]
    M -->|NO| O[STATUS_WAITING_FOR_OTHERS]
    
    N --> P[Determinar Status Inicial]
    P --> Q{Type de Etapa?}
    
    Q -->|7,10,11| R[STATUS_AUTOMATED_TASK 60]
    Q -->|Otros| S[STATUS_INITIALIZED 20]
    
    R --> T[Si EXTERNAL_AUTOMATION<br/>Enviar Inmediato al Gateway]
    S --> U[Marcar Actual Completada]
    T --> U
    U --> V[Actualizar Job Status]
```

## Explicación:

1. **PropagateMetadata**: Copia metadata de tarea actual a siguiente
2. **Buscar Transiciones**: Lee todas las transiciones posibles desde stage actual
3. **Evaluar Condiciones**: Usa eval_condition para cada transición
4. **Verificar Hermanos**: Chequea si hay tareas paralelas esperando
5. **Crear Nueva Tarea**: INSERT en jwk_task
6. **Determinar Status**: 60 para automáticas, 20 para manuales
7. **Marcar Completada**: UPDATE status=30 en tarea actual
8. **Actualizar Job**: UPDATE jwjo_status

## Código clave:

```php
// jwf_common_functions.php línea 1165
function StepForward($job, $user, ...) {
    PropagateMetadata($job);
    
    foreach ($job["next_stages"] as $n) {
        $condition_result = eval_condition($condition, $job, $mvalue);
        if ($condition_result) {
            $nexts[] = array($to, $transition_group, $job_status, $from);
        }
    }
    
    // Crear nueva tarea
    INSERT INTO jwk_task (jwta_job, jwta_stage, jwta_status, ...)
    
    // Marcar actual completada
    UPDATE jwk_task SET jwta_status=30 WHERE jwta_id=...
}
```

