const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length) env[key.trim()] = value.join('=').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log("Testing insert...");
  const res = await supabase.from('gastos').insert([{
    descripcion: 'TEST GASTO',
    monto: 100,
    categoria: 'Operación',
    fecha: new Date().toISOString().split('T')[0]
  }]);
  console.log(JSON.stringify(res, null, 2));
}

testInsert();
