@echo off
setlocal
cd /d "%~dp0"
del /q deploy-phase0.bat 2>nul
git add -A
git reset -- scan-results.json 2>nul
echo Staged:
git diff --cached --stat | findstr /R "file.*changed files.*changed"
git commit -m "feat: production loop hardening + demo retirement progress" -m "Combined verified work from the DEMO-RETIRE-01 session and the Codex session (typecheck + next build passed on this tree):" -m "- Real Supabase request id drives request -> matches -> listing -> agreement -> workspace (no fake request-*/agreement-* ids in live flows)" -m "- Real location capture: geocoding endpoint + helper, addresses/place ids/coordinates stored for requests, paddocks, agreements (migration 20260611203000)" -m "- Canonical agreement sections per master spec: stock_type, duration, rate, start_date, transport, special_conditions, with self-heal migration (20260611210000)" -m "- RFT creation hardened: refuses incomplete data, uses canonical start_date, stores route distance; board shows distance" -m "- Transport milestones model + timeline + driver one-tap check-in (migration 20260611190000); agistment settlement record at transport completion with honest no-Stripe-yet handling" -m "- Demo removal: prototypeStore and nine demo clients/components deleted; repository layer no longer falls back to demo records; onboarding/request localStorage business data removed; persona keys cleanup" -m "- Real-only rewrites of dashboard, profile, listings, messages, map, requests, transport pages; app error/loading/not-found pages added"

if errorlevel 1 ( echo COMMIT FAILED & pause & exit /b 1 )
echo Committed (NOT pushed - migrations go first).
pause
