-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Add embedding column to items
-- all-MiniLM-L6-v2 output is 384 dimensions
alter table items add column if not exists embedding vector(384);

-- Create a function to search for similar items
create or replace function match_items (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id text,
  title text,
  description text,
  type text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    items.id,
    items.title,
    items.description,
    items.type,
    1 - (items.embedding <=> query_embedding) as similarity
  from items
  where 1 - (items.embedding <=> query_embedding) > match_threshold
  order by items.embedding <=> query_embedding
  limit match_count;
end;
$$;
