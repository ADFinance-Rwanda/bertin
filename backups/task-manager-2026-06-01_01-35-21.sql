--
-- PostgreSQL database dump
--

\restrict fzqzPyrpmyx9mdu9DhcOxl22uxJEdT8loYcm5lmtB8hiRtkewxUSW23Aoa4j2pq

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP TRIGGER IF EXISTS tasks_updated_at ON public.tasks;
DROP INDEX IF EXISTS public.idx_tasks_owner_status;
DROP INDEX IF EXISTS public.idx_tasks_owner_id;
DROP INDEX IF EXISTS public.idx_tasks_created_at;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.migrations DROP CONSTRAINT IF EXISTS "PK_8c82d7f526340ab734260ea46be";
ALTER TABLE IF EXISTS public.migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.tasks;
DROP SEQUENCE IF EXISTS public.migrations_id_seq;
DROP TABLE IF EXISTS public.migrations;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP TYPE IF EXISTS public.task_status;
DROP TYPE IF EXISTS public.task_priority;
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: task_priority; Type: TYPE; Schema: public; Owner: taskuser
--

CREATE TYPE public.task_priority AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public.task_priority OWNER TO taskuser;

--
-- Name: task_status; Type: TYPE; Schema: public; Owner: taskuser
--

CREATE TYPE public.task_status AS ENUM (
    'todo',
    'in_progress',
    'done'
);


ALTER TYPE public.task_status OWNER TO taskuser;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: taskuser
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO taskuser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: taskuser
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO taskuser;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: taskuser
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO taskuser;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: taskuser
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: taskuser
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status public.task_status DEFAULT 'todo'::public.task_status NOT NULL,
    priority public.task_priority DEFAULT 'medium'::public.task_priority NOT NULL,
    owner_id uuid NOT NULL,
    due_date timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tasks OWNER TO taskuser;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: taskuser
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: taskuser
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1700000000000	CreateTasksTable1700000000000
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: taskuser
--

COPY public.tasks (id, title, description, status, priority, owner_id, due_date, completed_at, created_at, updated_at) FROM stdin;
976f7389-8cfd-4ba7-8bdd-dceb1e1243bb	Testing 2	Hello there	todo	low	59375fa5-8a54-4e0d-b7b5-2ca64e5fcd70	2026-05-31 00:00:00+00	\N	2026-05-31 09:28:03.34963+00	2026-05-31 09:28:03.34963+00
d9d3c4d8-792b-477d-8719-6170ce03ceb8	Test 1	Testing frontend	done	high	59375fa5-8a54-4e0d-b7b5-2ca64e5fcd70	2026-05-05 00:00:00+00	2026-05-31 09:28:23.129+00	2026-05-31 09:27:18.149716+00	2026-05-31 09:28:23.132369+00
3e20a38e-809b-4326-b522-00aaaf4bc6f8	New test	Tesign	in_progress	medium	aa36a2ac-bf5e-4566-9dd4-fa2ac2aaa83a	2026-07-02 00:00:00+00	\N	2026-05-31 23:28:37.043069+00	2026-05-31 23:28:37.043069+00
ee31f4e9-72f5-4067-9dd2-411dc9542d6f	Hello there	Hello	done	high	aa36a2ac-bf5e-4566-9dd4-fa2ac2aaa83a	2026-05-06 00:00:00+00	\N	2026-05-31 23:29:01.576405+00	2026-05-31 23:29:01.576405+00
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: taskuser
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, true);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: taskuser
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: taskuser
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: idx_tasks_created_at; Type: INDEX; Schema: public; Owner: taskuser
--

CREATE INDEX idx_tasks_created_at ON public.tasks USING btree (owner_id, created_at DESC);


--
-- Name: idx_tasks_owner_id; Type: INDEX; Schema: public; Owner: taskuser
--

CREATE INDEX idx_tasks_owner_id ON public.tasks USING btree (owner_id);


--
-- Name: idx_tasks_owner_status; Type: INDEX; Schema: public; Owner: taskuser
--

CREATE INDEX idx_tasks_owner_status ON public.tasks USING btree (owner_id, status);


--
-- Name: tasks tasks_updated_at; Type: TRIGGER; Schema: public; Owner: taskuser
--

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- PostgreSQL database dump complete
--

\unrestrict fzqzPyrpmyx9mdu9DhcOxl22uxJEdT8loYcm5lmtB8hiRtkewxUSW23Aoa4j2pq

