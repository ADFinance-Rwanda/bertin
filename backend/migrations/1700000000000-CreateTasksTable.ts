import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasksTable1700000000000 implements MigrationInterface {
  name = 'CreateTasksTable1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      CREATE TABLE IF NOT EXISTS tasks (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title         VARCHAR(255) NOT NULL,
        description   TEXT,
        status        task_status NOT NULL DEFAULT 'todo',
        priority      task_priority NOT NULL DEFAULT 'medium',
        owner_id      UUID NOT NULL,
        due_date      TIMESTAMPTZ,
        completed_at  TIMESTAMPTZ,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_owner_id
        ON tasks(owner_id);

      CREATE INDEX IF NOT EXISTS idx_tasks_owner_status
        ON tasks(owner_id, status);

      CREATE INDEX IF NOT EXISTS idx_tasks_created_at
        ON tasks(owner_id, created_at DESC);

      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
      CREATE TRIGGER tasks_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
      DROP FUNCTION IF EXISTS update_updated_at_column;
      DROP TABLE IF EXISTS tasks;
      DROP TYPE IF EXISTS task_priority;
      DROP TYPE IF EXISTS task_status;
    `);
  }
}
