
# Kanban Engagement Starter Kit

This package includes:
- **Postgres** schema (`db/schema.sql`) with enums, triggers, guardrails, and views.
- **Seed data** (`db/seed.sql`) for managers, reps, accounts, engagements, and milestones.
- **React + Vite** Kanban board scaffold (`app/`) using **DnD Kit** for drag & drop.

## Setup — Database

1. Create a Postgres database (14+ recommended).
2. Run schema and seed:
   ```bash
   psql -d your_db -f db/schema.sql
   psql -d your_db -f db/seed.sql
   ```
3. Explore helpful views:
   ```sql
   SELECT * FROM vw_engagement_progress;
   SELECT * FROM vw_engagement_with_manager;
   ```

## Setup — React app

```bash
cd app
npm install
npm run dev
```

Then visit http://localhost:5173

## Wiring the Frontend to the DB (later)

This scaffold uses in-memory mock data. When you add an API, map these operations:

- **GET /engagements/:id** → hydrate the page (engagement + milestones).
- **PATCH /engagements/:id** → update `status`.
- **PATCH /engagements/:id/milestones/:mid** → update `stage` on drag.
- Optional activity logs: POST to `/activity` or let DB triggers handle on the server side.

### Example SQL snippets

Percent complete (unweighted):
```sql
SELECT * FROM vw_engagement_progress WHERE engagement_id = '<id>';
```

Block COMPLETED unless all milestones completed is enforced by `trg_guard_completed` in `schema.sql`.

## Status/Stage Reference

- Project Status: `NEW, KICK_OFF, IN_PROGRESS, LAUNCHED, STALLED, ON_HOLD, CLAWED_BACK, COMPLETED`
- Milestone Stage: `NOT_STARTED, INITIAL_CALL, WORKSHOP, COMPLETED`

## Milestones in Default Template

Kick-off, Workflow Design, Content Strategy, CRM Integration, Data Migration, Governance, Change Readiness, User Training, Office Hours, Manager Training, Admin Training, Meet Add-On, Deal Add-On, Forecast Add-On.
