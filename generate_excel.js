const XLSX = require('xlsx');

const data = [
  { Nombre: "Carlos Pérez", Telefono: "+584141234567", Puntos: 1500, Ganadas: 3 },
  { Nombre: "María Silva", Telefono: "+584129876543", Puntos: 800, Ganadas: 1 },
  { Nombre: "José López", Telefono: "0416-5555555", Puntos: 2100, Ganadas: 5 },
  { Nombre: "Ana Gómez", Telefono: "", Puntos: 0, Ganadas: 0 }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Jugadores");
XLSX.writeFile(wb, "Plantilla_Jugadores.xlsx");
console.log("Excel file generated successfully.");
