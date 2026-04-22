const XLSX = require('xlsx');
const path = require('path');

const data = [
  { "Nombre": "Carlos Alcaraz", "Telefono": "555-1234", "Victorias": 15, "Puntos": 1500 },
  { "Jugador": "Iga Swiatek", "Celular": "555-5678", "Wins": 22, "Points": 2200 },
  { "Name": "Novak Djokovic", "Phone": "555-9999", "Ganadas": 40, "Puntos": 4000 }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Jugadores");

const filePath = path.join(process.cwd(), 'demo_jugadores.xlsx');
XLSX.writeFile(wb, filePath);
console.log('Archivo demo_jugadores.xlsx creado en: ' + filePath);
