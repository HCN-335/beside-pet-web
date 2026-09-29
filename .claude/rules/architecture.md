# Web architecture

- Pages in `app/` assemble flows; feature stores own interaction state.
- Backend calls go through `lib/api/`, with transport in `lib/http/`. Components do not call models or hold API secrets.
- The server owns conversation stage and progress. The client renders the returned state.
- Keep session and language behavior consistent with `docs/ARCHITECTURE.md` and the API contract.
- Crisis resources remain accessible without a paid plan or chat session.
