-- Create table for auditing sales changes
create table if not exists public.auditoria_ventas (
  "idAuditoria" serial primary key,
  "idVenta" integer not null references public.ventas("idVenta"),
  "usuario" text, -- Username or User ID
  "accion" text not null, -- 'EDICION_HEADER', 'AGREGAR_ITEM', 'REMOVER_ITEM', 'CAMBIO_CANTIDAD'
  "detalles" jsonb, -- JSON with details of the change
  "fecha" timestamp with time zone default now()
);

-- RLS: Enable strict access if needed (assuming public/anon for now or handled by service role)
alter table public.auditoria_ventas enable row level security;
    
create policy "Enable read access for authenticated users"
on "public"."auditoria_ventas"
as PERMISSIVE
for SELECT
to authenticated
using (true);

create policy "Enable write access for authenticated users"
on "public"."auditoria_ventas"
as PERMISSIVE
for INSERT
to authenticated
with check (true);
