-- Datos de presentación, encuadre, programa y tipo de tema/clase

ALTER TABLE subjects ADD COLUMN IF NOT EXISTS university TEXT
  DEFAULT 'Universidad Juárez Autónoma de Tabasco';
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS division TEXT
  DEFAULT 'División Académica de Ciencias y Tecnologías de la Información';
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS project_name TEXT;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS degree TEXT;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS course_code TEXT;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS course_name TEXT;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS group_name TEXT;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS encuadre TEXT;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS programa TEXT;

ALTER TABLE topics ADD COLUMN IF NOT EXISTS topic_type TEXT NOT NULL DEFAULT 'tema'
  CHECK (topic_type IN ('tema', 'clase'));
