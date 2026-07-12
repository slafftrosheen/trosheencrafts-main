import postgres from 'postgres';

async function test() {
  const url = 'postgresql://postgres:postgres@localhost:5432/postgres';
  console.log('Testing connection to:', url);
  const sql = postgres(url);
  try {
    const res = await sql`SELECT 1`;
    console.log('Success!', res);
  } catch (e) {
    console.error('Failed:', e);
  }
  await sql.end();
}

test();
