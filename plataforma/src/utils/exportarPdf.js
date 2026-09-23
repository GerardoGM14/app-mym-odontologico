const cargarImagen = (url) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = url;
});

// Captura un elemento como imagen y lo guarda en un PDF con encabezado, fecha y logo.
// html2canvas no entiende los colores oklch de Tailwind v4, por eso se captura
// un clon con colores simples en lugar del elemento original.
export async function exportarElementoAPdf(elemento, { titulo, archivo, logoUrl }) {
  // Se cargan bajo demanda: son librerías pesadas que solo se usan aquí.
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);

  const clon = elemento.cloneNode(true);
  Object.assign(clon.style, {
    position: 'absolute', left: '-9999px', width: `${elemento.offsetWidth}px`,
    backgroundColor: '#ffffff', color: '#000000', padding: '20px',
  });
  clon.querySelectorAll('*').forEach((el) => {
    el.style.color = '#000';
    el.style.backgroundColor = '#fff';
    el.style.boxShadow = 'none';
    el.style.borderColor = '#ddd';
  });
  clon.querySelectorAll('[data-no-pdf]').forEach((el) => el.remove());
  document.body.appendChild(clon);

  try {
    const canvas = await html2canvas(clon, { scale: 2, useCORS: true });
    const pxAMm = (px) => px * 0.264583;
    const ancho = pxAMm(canvas.width);
    const alto = pxAMm(canvas.height) + 20;

    const pdf = new jsPDF('landscape', 'mm', [ancho, alto]);
    pdf.setFontSize(16);
    pdf.setTextColor(33, 37, 41);
    pdf.text(titulo, 14, 20);
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 10, 30, ancho - 20, alto - 50);

    const fecha = new Date().toLocaleString('es-PE', { hour12: false });
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Fecha de generación: ${fecha}`, 14, alto - 10);

    const logo = logoUrl ? await cargarImagen(logoUrl) : null;
    if (logo) {
      const anchoLogo = 40;
      const altoLogo = (anchoLogo * logo.naturalHeight) / logo.naturalWidth;
      pdf.addImage(logo, 'JPEG', ancho - anchoLogo - 10, alto - altoLogo - 4, anchoLogo, altoLogo);
    }

    pdf.save(archivo);
  } finally {
    clon.remove();
  }
}
