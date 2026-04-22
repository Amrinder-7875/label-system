# Admin Dashboard Updates

✅ Previous tasks complete (releases on home, streams real/fixed, tracks/audience removed)

## New Task: Schedule Section New Release Button

**Status: In Progress**

**Plan Confirmed:** Add "+ New Scheduled Release" button in src/pages/scheddule.jsx with form: release date, track name, artist name. POST to /api/releases (status="scheduled", date set).

**Steps:**
1. [ ] Edit src/pages/scheddule.jsx - Add PrimaryBtn "+ New Scheduled Release", modal form (date input, track name, artist name), POST /api/releases.
2. [ ] Backend ready (release POST supports date/track/artist? Adjust if needed).
3. [ ] Test: Add scheduled release, verify in schedule table, /api/schedule shows.
4. [ ] Mark complete.

Run `npm run dev` for hot-reload.
