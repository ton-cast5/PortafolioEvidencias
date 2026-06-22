-- ============================================================
-- Seed: Materia Compiladores con 6 unidades
-- Ejecutar DESPUÉS de registrarse el primer usuario
-- Reemplazar 'YOUR_USER_ID' con el UUID del usuario autenticado
-- ============================================================

-- Función para inicializar el portafolio de Compiladores
CREATE OR REPLACE FUNCTION seed_compiladores_portfolio(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_subject_id UUID;
  v_unit_id UUID;
BEGIN
  -- Crear materia
  INSERT INTO subjects (name, description, user_id)
  VALUES (
    'Compiladores',
    'Portafolio académico de la materia de Compiladores. Incluye análisis léxico, sintáctico, gramáticas, fase de síntesis y tabla de símbolos.',
    p_user_id
  )
  RETURNING id INTO v_subject_id;

  -- Unidad 1: Generalidades
  INSERT INTO units (title, description, order_index, subject_id, user_id)
  VALUES (
    'Unidad 1: Generalidades',
    'Introducción a los compiladores, fases de compilación, herramientas y conceptos fundamentales.',
    1, v_subject_id, p_user_id
  ) RETURNING id INTO v_unit_id;

  INSERT INTO topics (title, description, unit_id, user_id) VALUES
    ('1.1 Introducción a los compiladores', 'Definición, tipos de traductores, ventajas y desventajas.', v_unit_id, p_user_id),
    ('1.2 Fases de compilación', 'Análisis y síntesis, flujo del compilador.', v_unit_id, p_user_id),
    ('1.3 Herramientas de construcción', 'Lex, Yacc, ANTLR, Flex, Bison.', v_unit_id, p_user_id);

  -- Unidad 2: Análisis Léxico
  INSERT INTO units (title, description, order_index, subject_id, user_id)
  VALUES (
    'Unidad 2: Análisis Léxico',
    'Reconocimiento de tokens, expresiones regulares, autómatas finitos y generadores de analizadores léxicos.',
    2, v_subject_id, p_user_id
  ) RETURNING id INTO v_unit_id;

  INSERT INTO topics (title, description, unit_id, user_id) VALUES
    ('2.1 Tokens y expresiones regulares', 'Definición de tokens, ER, operadores.', v_unit_id, p_user_id),
    ('2.2 Autómatas finitos', 'AFD, AFN, conversión y minimización.', v_unit_id, p_user_id),
    ('2.3 Generadores léxicos', 'Flex, implementación de analizadores léxicos.', v_unit_id, p_user_id);

  -- Unidad 3: Gramáticas
  INSERT INTO units (title, description, order_index, subject_id, user_id)
  VALUES (
    'Unidad 3: Gramáticas',
    'Gramáticas libres de contexto, derivaciones, árboles de parseo y formas normales.',
    3, v_subject_id, p_user_id
  ) RETURNING id INTO v_unit_id;

  INSERT INTO topics (title, description, unit_id, user_id) VALUES
    ('3.1 Gramáticas libres de contexto', 'Definición, producciones, notación BNF.', v_unit_id, p_user_id),
    ('3.2 Derivaciones y árboles', 'Derivaciones leftmost/rightmost, árboles de parseo.', v_unit_id, p_user_id),
    ('3.3 Formas normales', 'FNCh, FNC, eliminación de ambigüedades.', v_unit_id, p_user_id);

  -- Unidad 4: Análisis Sintáctico
  INSERT INTO units (title, description, order_index, subject_id, user_id)
  VALUES (
    'Unidad 4: Análisis Sintáctico',
    'Análisis descendente y ascendente, LL, LR, parsers y manejo de errores sintácticos.',
    4, v_subject_id, p_user_id
  ) RETURNING id INTO v_unit_id;

  INSERT INTO topics (title, description, unit_id, user_id) VALUES
    ('4.1 Análisis descendente', 'LL(1), factorización, eliminación de recursividad.', v_unit_id, p_user_id),
    ('4.2 Análisis ascendente', 'LR(0), SLR, LALR, tablas de análisis.', v_unit_id, p_user_id),
    ('4.3 Parsers y errores', 'Yacc/Bison, recuperación de errores sintácticos.', v_unit_id, p_user_id);

  -- Unidad 5: Fase de Síntesis
  INSERT INTO units (title, description, order_index, subject_id, user_id)
  VALUES (
    'Unidad 5: Fase de Síntesis',
    'Generación de código intermedio, optimización y generación de código objeto.',
    5, v_subject_id, p_user_id
  ) RETURNING id INTO v_unit_id;

  INSERT INTO topics (title, description, unit_id, user_id) VALUES
    ('5.1 Código intermedio', 'TAC, cuádruplos, triples, DAG.', v_unit_id, p_user_id),
    ('5.2 Optimización de código', 'Optimización local y global, análisis de flujo de datos.', v_unit_id, p_user_id),
    ('5.3 Generación de código', 'Selección de instrucciones, asignación de registros.', v_unit_id, p_user_id);

  -- Unidad 6: Tabla de símbolos y memoria
  INSERT INTO units (title, description, order_index, subject_id, user_id)
  VALUES (
    'Unidad 6: Tabla de símbolos y memoria',
    'Gestión de símbolos, scopes, asignación de memoria estática y dinámica.',
    6, v_subject_id, p_user_id
  ) RETURNING id INTO v_unit_id;

  INSERT INTO topics (title, description, unit_id, user_id) VALUES
    ('6.1 Tabla de símbolos', 'Estructuras, scopes, inserción y búsqueda.', v_unit_id, p_user_id),
    ('6.2 Gestión de memoria', 'Pila, heap, activación de funciones.', v_unit_id, p_user_id),
    ('6.3 Tipos y chequeo', 'Sistema de tipos, compatibilidad, conversión.', v_unit_id, p_user_id);

  RETURN v_subject_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
