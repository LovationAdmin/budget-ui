// src/i18n/es/tools.ts
// The Spanish pages, for the links between them (footer, « otras calculadoras
// gratuitas », the /es home, prerendered navigation). A new Spanish page goes
// here too.

export const ES_TOOLS: ReadonlyArray<{ path: string; label: string; short: string; text: string }> = [
  { path: '/es/calculadora-presupuesto-50-30-20', label: 'Calculadora de presupuesto 50/30/20', short: 'Regla 50/30/20', text: 'Necesidades, deseos y ahorro: reparte tu sueldo con la regla 50/30/20.' },
  { path: '/es/calculadora-dividir-alquiler', label: 'Calculadora para dividir el alquiler', short: 'Dividir el alquiler', text: 'A partes iguales, por tamaño de habitación o según los ingresos: lo que paga cada compañero de piso.' },
  { path: '/es/calculadora-presupuesto-boda', label: 'Calculadora de presupuesto de boda', short: 'Presupuesto de boda', text: 'El coste total de la boda, el precio por invitado y cuánto ahorrar cada mes.' },
  { path: '/es/calculadora-dinero-disponible', label: 'Calculadora de dinero disponible', short: 'Dinero disponible', text: 'Lo que te queda cada mes después de los gastos fijos, por persona y por día.' },
];
